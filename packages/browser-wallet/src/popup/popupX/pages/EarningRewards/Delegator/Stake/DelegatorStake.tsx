/* eslint-disable react/destructuring-assignment */
import React, { useEffect, useMemo, useState } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { useAsyncMemo } from 'wallet-common-helpers';
import {
    AccountTransactionType,
    CcdAmount,
    ConfigureDelegationPayload,
    DelegationTargetType,
} from '@concordium/web-sdk';

import Button from '@popup/popupX/shared/Button';
import FormToggleCheckbox from '@popup/popupX/shared/Form/ToggleCheckbox';
import Page from '@popup/popupX/shared/Page';
import Form, { useForm } from '@popup/popupX/shared/Form';
import TokenAmount, { AmountForm } from '@popup/popupX/shared/Form/TokenAmount';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { displayNameAndSplitAddress, useSelectedCredential } from '@popup/shared/utils/account-helpers';
import { formatCcdAmount, formatTokenAmount, parseCcdAmount } from '@popup/popupX/shared/utils/helpers';
import { CCD_METADATA } from '@shared/constants/token-metadata';
import { grpcClientAtom } from '@popup/store/settings';
import Text from '@popup/popupX/shared/Text';
import { useGetTransactionFee } from '@popup/shared/utils/transaction-helpers';
import FullscreenNotice, { FullscreenNoticeProps } from '@popup/popupX/shared/FullscreenNotice';

import { DelegationTypeForm, DelegatorForm, DelegatorStakeForm, configureDelegatorPayloadFromForm } from '../util';
import { STAKE_WARNING_THRESHOLD, isAboveStakeWarningThreshold } from '../../util';

type PoolInfoProps = {
    /** The validator pool ID to show information for */
    validatorId: bigint;
};

function PoolInfo({ validatorId }: PoolInfoProps) {
    const { t } = useTranslation('x', { keyPrefix: 'earn.delegator.stake' });
    const client = useAtomValue(grpcClientAtom);
    const poolStatus = useAsyncMemo(async () => client.getPoolInfo(validatorId), undefined, []);

    if (poolStatus?.bakerEquityCapital === undefined) {
        return null;
    }

    const poolStake = poolStatus.bakerEquityCapital.microCcdAmount + poolStatus.delegatedCapital!.microCcdAmount;

    return (
        <div className="register-delegator__pool-info">
            <div className="register-delegator__pool-info_row">
                <Text.Capture>{t('poolStake.label')}</Text.Capture>
                <Text.Capture>
                    {t('poolStake.value', { amount: formatTokenAmount(poolStake, CCD_METADATA.decimals, 2) })}
                </Text.Capture>
            </div>
            <div className="register-delegator__pool-info_row">
                <Text.Capture>{t('poolCap.label')}</Text.Capture>
                <Text.Capture>
                    {t('poolCap.value', {
                        amount: formatTokenAmount(
                            poolStatus.delegatedCapitalCap!.microCcdAmount,
                            CCD_METADATA.decimals,
                            2
                        ),
                    })}
                </Text.Capture>
            </div>
        </div>
    );
}

type HighStakeNoticeProps = FullscreenNoticeProps & {
    onContinue(): void;
};

function HighStakeWarning({ onContinue, ...props }: HighStakeNoticeProps) {
    const { t } = useTranslation('x', { keyPrefix: 'earn.delegator.stake.overStakeThresholdWarning' });
    return (
        <FullscreenNotice {...props}>
            <Page>
                <Page.Top heading={t('title')} />
                <Text.Capture>{t('description', { threshold: STAKE_WARNING_THRESHOLD.toString() })}</Text.Capture>
                <Page.Footer>
                    <Button.Main label={t('buttonContinue')} onClick={onContinue} />
                    <Button.Main label={t('buttonBack')} onClick={props.onClose} />
                </Page.Footer>
            </Page>
        </FullscreenNotice>
    );
}

type Props = {
    /** The title for the configuriation step */
    title: string;
    /** The initial values of the step, if any */
    initialValues?: DelegatorStakeForm;
    /** The delegation target of the transaction */
    target: DelegationTypeForm;
    /** The existing delegation values registered on the account */
    existingValues: DelegatorForm | undefined;
    /** The submit handler triggered when submitting the form in the step */
    onSubmit(values: DelegatorStakeForm): void;
};

export default function DelegatorStake({ title, target, initialValues, existingValues, onSubmit }: Props) {
    const { t } = useTranslation('x', { keyPrefix: 'earn.delegator.stake' });
    const form = useForm<DelegatorStakeForm>({
        defaultValues: initialValues ?? { amount: '0.00', redelegate: true },
    });
    const submit = form.handleSubmit(onSubmit);
    const selectedCred = useSelectedCredential();
    const selectedAccountInfo = useAccountInfo(selectedCred);
    const [highStakeWarning, setHighStakeWarning] = useState(false);

    const values = form.watch();
    const getCost = useGetTransactionFee();
    const fee = useMemo(() => {
        let payload: ConfigureDelegationPayload;
        try {
            //  We try here, as parsing invalid CCD amounts from the input can fail.
            payload = configureDelegatorPayloadFromForm({ target, stake: values }, existingValues);
        } catch {
            // Fall back to a payload from a form with any parsable amount
            payload = configureDelegatorPayloadFromForm(
                {
                    target: {
                        type: target?.type ?? DelegationTargetType.PassiveDelegation,
                        bakerId: target?.bakerId,
                    },
                    stake: { amount: '0', redelegate: values.redelegate ?? false },
                },
                existingValues
            );
        }
        return getCost(AccountTransactionType.ConfigureDelegation, payload);
    }, [target, values, getCost]);

    useEffect(() => {
        if (selectedAccountInfo === undefined || fee === undefined) {
            return;
        }

        try {
            const parsed = parseCcdAmount(values.amount);
            const newMax = CcdAmount.fromMicroCcd(
                selectedAccountInfo.accountAmount.microCcdAmount - fee.microCcdAmount
            );
            if (parsed.microCcdAmount > newMax.microCcdAmount) {
                form.setValue('amount', formatCcdAmount(newMax), { shouldValidate: true });
            }
        } catch {
            // Do nothing..
        }
    }, [selectedAccountInfo?.accountAmount, fee]);

    if (selectedAccountInfo === undefined || selectedCred === undefined || fee === undefined) {
        return null;
    }

    const handleSubmit = () => {
        if (!form.formState.errors.amount === undefined) {
            submit(); // To set the form to submitted.
            return;
        }

        const amount = parseCcdAmount(form.getValues().amount);
        if (isAboveStakeWarningThreshold(amount.microCcdAmount, selectedAccountInfo)) {
            setHighStakeWarning(true);
        } else {
            submit();
        }
    };

    return (
        <>
            <HighStakeWarning open={highStakeWarning} onClose={() => setHighStakeWarning(false)} onContinue={submit} />
            <Page className="register-delegator-container">
                <Page.Top heading={title} />
                <Text.Capture className="m-l-5 m-t-neg-5">
                    {t('selectedAccount', { account: displayNameAndSplitAddress(selectedCred) })}
                </Text.Capture>
                <Form formMethods={form} onSubmit={handleSubmit}>
                    {(f) => (
                        <>
                            <TokenAmount
                                className="register-delegator__token-card"
                                accountInfo={selectedAccountInfo}
                                fee={fee}
                                tokenType="ccd"
                                buttonMaxLabel={t('inputAmount.buttonMax')}
                                form={f as unknown as UseFormReturn<AmountForm>}
                                ccdBalance="total"
                            />
                            {target.type === DelegationTargetType.Baker && (
                                <PoolInfo validatorId={BigInt(target.bakerId!)} />
                            )}
                            <div className="register-delegator__reward">
                                <div className="register-delegator__reward_auto-add">
                                    <Text.Main>{t('redelegate.label')}</Text.Main>
                                    <FormToggleCheckbox register={f.register} name="redelegate" />
                                </div>
                                <Text.Capture>{t('redelegate.description')}</Text.Capture>
                            </div>
                        </>
                    )}
                </Form>
                <Page.Footer>
                    <Button.Main className="m-t-20" label={t('buttonContinue')} onClick={handleSubmit} />
                </Page.Footer>
            </Page>
        </>
    );
}
