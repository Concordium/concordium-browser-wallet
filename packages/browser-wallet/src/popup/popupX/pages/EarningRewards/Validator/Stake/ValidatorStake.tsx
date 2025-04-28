/* eslint-disable react/destructuring-assignment */
import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { UseFormReturn, Validate } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { AccountTransactionType, CcdAmount, ConfigureBakerPayload, OpenStatus } from '@concordium/web-sdk';

import Button from '@popup/popupX/shared/Button';
import FormToggleCheckbox from '@popup/popupX/shared/Form/ToggleCheckbox';
import Page from '@popup/popupX/shared/Page';
import Form, { useForm } from '@popup/popupX/shared/Form';
import TokenAmount, { AmountForm } from '@popup/popupX/shared/Form/TokenAmount';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { displayNameAndSplitAddress, useSelectedCredential } from '@popup/shared/utils/account-helpers';
import { formatCcdAmount, parseCcdAmount } from '@popup/popupX/shared/utils/helpers';
import Text from '@popup/popupX/shared/Text';
import { useGetTransactionFee } from '@popup/shared/utils/transaction-helpers';
import FullscreenNotice, { FullscreenNoticeProps } from '@popup/popupX/shared/FullscreenNotice';

import { METADATAURL_MAX_LENGTH } from '@shared/constants/baking';
import { displayAsCcd } from 'wallet-common-helpers';
import { STAKE_WARNING_THRESHOLD, isAboveStakeWarningThreshold } from '../../util';
import { ValidatorStakeForm } from '../util';

type HighStakeNoticeProps = FullscreenNoticeProps & {
    onContinue(): void;
};

function HighStakeWarning({ onContinue, ...props }: HighStakeNoticeProps) {
    const { t } = useTranslation('x', { keyPrefix: 'earn.validator.stake.overStakeThresholdWarning' });
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

const PAYLOAD_MAX: ConfigureBakerPayload = {
    keys: {
        electionVerifyKey: '0000000000000000000000000000000000000000000000000000000000000000',
        signatureVerifyKey: '0000000000000000000000000000000000000000000000000000000000000000',
        aggregationVerifyKey:
            '000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        proofSig:
            '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        proofElection:
            '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
        proofAggregation:
            '00000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000000',
    },
    finalizationRewardCommission: 0,
    transactionFeeCommission: 0,
    bakingRewardCommission: 0,
    stake: CcdAmount.zero(),
    openForDelegation: OpenStatus.OpenForAll,
    restakeEarnings: true,
    metadataUrl: 'a'.repeat(METADATAURL_MAX_LENGTH),
};

const PAYLOAD_MIN: ConfigureBakerPayload = { ...PAYLOAD_MAX, metadataUrl: '' };

type Props = {
    /** The title for the configuriation step */
    title: string;
    /** The minimum stake required to be a validator */
    minStake: CcdAmount.Type;
    /** The initial values of the step, if any */
    initialValues?: ValidatorStakeForm;
    /** The existing validation stake values registered on the account */
    existingValues?: ValidatorStakeForm;
    /** The submit handler triggered when submitting the form in the step */
    onSubmit(values: ValidatorStakeForm): void;
};

export default function ValidatorStake({ title, initialValues, existingValues, onSubmit, minStake }: Props) {
    const { t } = useTranslation('x', { keyPrefix: 'earn.validator.stake' });
    const form = useForm<ValidatorStakeForm>({
        defaultValues: initialValues ?? { amount: '0.00', restake: true },
    });
    const submit = form.handleSubmit(onSubmit);
    const selectedCred = useSelectedCredential();
    const selectedAccountInfo = useAccountInfo(selectedCred);
    const [highStakeWarning, setHighStakeWarning] = useState(false);

    const values = form.watch();
    const getCost = useGetTransactionFee();
    const fee = useMemo(() => {
        if (existingValues === undefined) {
            return getCost(AccountTransactionType.ConfigureBaker, PAYLOAD_MAX);
        }

        try {
            let stake: CcdAmount.Type | undefined;
            if (values.amount !== existingValues?.amount) {
                stake = parseCcdAmount(values.amount);
            }
            let restake: boolean | undefined;
            if (values.restake !== existingValues?.restake) {
                restake = values.restake;
            }

            const payload: ConfigureBakerPayload = { stake, restakeEarnings: restake };
            return getCost(AccountTransactionType.ConfigureBaker, payload);
        } catch {
            // We failed to parse the amount
            return undefined;
        }
    }, [getCost, existingValues, values]);

    const minFee = useMemo(() => {
        if (existingValues !== undefined) {
            return undefined; // We know the cost as we don't depend on values set later in the flow
        }

        return getCost(AccountTransactionType.ConfigureBaker, PAYLOAD_MIN);
    }, [getCost, existingValues]);

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

    const formatFee: undefined | ((v: CcdAmount.Type) => ReactNode) = useMemo(() => {
        if (minFee === undefined) {
            return undefined;
        }

        // eslint-disable-next-line react/function-component-definition
        return (v) => (
            <div>
                {displayAsCcd(minFee, false, true)} - {displayAsCcd(v, false, true)}
            </div>
        );
    }, [minFee]);

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

    const validateAmount: Validate<string> = (v) => {
        const amount = parseCcdAmount(v);
        if (amount.microCcdAmount < minStake.microCcdAmount) {
            return t('inputAmount.errors.min', { min: formatCcdAmount(minStake) });
        }

        return undefined;
    };

    return (
        <>
            <HighStakeWarning open={highStakeWarning} onClose={() => setHighStakeWarning(false)} onContinue={submit} />
            <Page className="register-validator-container">
                <Page.Top heading={title} />
                <Text.Capture className="m-l-5 m-t-neg-5">
                    {t('selectedAccount', { account: displayNameAndSplitAddress(selectedCred) })}
                </Text.Capture>
                <Form formMethods={form} onSubmit={handleSubmit}>
                    {(f) => (
                        <>
                            <TokenAmount
                                className="register-validator__token-card"
                                accountInfo={selectedAccountInfo}
                                fee={fee}
                                formatFee={formatFee}
                                tokenType="ccd"
                                buttonMaxLabel={t('inputAmount.buttonMax')}
                                form={f as unknown as UseFormReturn<AmountForm>}
                                ccdBalance="total"
                                validateAmount={validateAmount}
                            />
                            <div className="register-validator__reward">
                                <div className="register-validator__reward_auto-add">
                                    <Text.Main>{t('restake.label')}</Text.Main>
                                    <FormToggleCheckbox register={f.register} name="restake" />
                                </div>
                                <Text.Capture>{t('restake.description')}</Text.Capture>
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
