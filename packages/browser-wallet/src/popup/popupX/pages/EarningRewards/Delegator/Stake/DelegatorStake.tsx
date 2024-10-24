import React, { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { useAsyncMemo } from 'wallet-common-helpers';
import { AccountTransactionType, DelegationTargetType } from '@concordium/web-sdk';

import Button from '@popup/popupX/shared/Button';
import FormToggleCheckbox from '@popup/popupX/shared/Form/ToggleCheckbox';
import Page from '@popup/popupX/shared/Page';
import Form, { useForm } from '@popup/popupX/shared/Form';
import TokenAmount, { AmountForm } from '@popup/popupX/shared/Form/TokenAmount';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { displayNameAndSplitAddress, useSelectedCredential } from '@popup/shared/utils/account-helpers';
import { formatTokenAmount } from '@popup/popupX/shared/utils/helpers';
import { CCD_METADATA } from '@shared/constants/token-metadata';
import { grpcClientAtom } from '@popup/store/settings';
import { useGetTransactionFee } from '@popup/popupX/shared/utils/transaction-helpers';

import { DelegationTypeForm, DelegatorStakeForm, configureDelegatorPayloadFromForm } from '../util';

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
                <span className="capture__main_small">{t('poolStake.label')}</span>
                <span className="capture__main_small">
                    {t('poolStake.value', { amount: formatTokenAmount(poolStake, CCD_METADATA.decimals, 2) })}
                </span>
            </div>
            <div className="register-delegator__pool-info_row">
                <span className="capture__main_small">{t('poolCap.label')}</span>
                <span className="capture__main_small">
                    {t('poolCap.value', {
                        amount: formatTokenAmount(
                            poolStatus.delegatedCapitalCap!.microCcdAmount,
                            CCD_METADATA.decimals,
                            2
                        ),
                    })}
                </span>
            </div>
        </div>
    );
}

type Props = {
    /** The title for the configuriation step */
    title: string;
    /** The initial values of the step, if any */
    initialValues?: DelegatorStakeForm;
    target: DelegationTypeForm;
    /** The submit handler triggered when submitting the form in the step */
    onSubmit(values: DelegatorStakeForm): void;
};

export default function DelegatorStake({ title, target, initialValues, onSubmit }: Props) {
    const { t } = useTranslation('x', { keyPrefix: 'earn.delegator.stake' });
    const form = useForm<DelegatorStakeForm>({
        defaultValues: initialValues ?? { amount: '0.00', redelegate: true },
    });
    const submit = form.handleSubmit(onSubmit);
    const selectedCred = useSelectedCredential();
    const selectedAccountInfo = useAccountInfo(selectedCred);
    const { amount, redelegate } = form.watch();
    const getCost = useGetTransactionFee(AccountTransactionType.ConfigureDelegation);
    const fee = useMemo(() => {
        const payload = configureDelegatorPayloadFromForm({ target, stake: { amount, redelegate } });
        return getCost(payload);
    }, [target, amount, redelegate, getCost]);

    if (selectedAccountInfo === undefined || selectedCred === undefined || fee === undefined) {
        return null;
    }

    return (
        <Page className="register-delegator-container">
            <Page.Top heading={title} />
            <span className="capture__main_small m-l-5 m-t-neg-5">
                {t('selectedAccount', { account: displayNameAndSplitAddress(selectedCred) })}
            </span>
            <Form formMethods={form} onSubmit={onSubmit}>
                {(f) => (
                    <>
                        <TokenAmount
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
                                <span className="text__main">{t('redelegate.label')}</span>
                                <FormToggleCheckbox register={f.register} name="redelegate" />
                            </div>
                            <span className="capture__main_small">{t('redelegate.description')}</span>
                        </div>
                    </>
                )}
            </Form>
            <Page.Footer>
                <Button.Main className="m-t-20" label={t('buttonContinue')} onClick={submit} />
            </Page.Footer>
        </Page>
    );
}
