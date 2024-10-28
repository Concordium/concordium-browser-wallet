import React, { useMemo } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { useAsyncMemo } from 'wallet-common-helpers';
import { AccountTransactionType, CcdAmount, DelegationTargetType } from '@concordium/web-sdk';

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
import Text from '@popup/popupX/shared/Text';
import { useGetTransactionFee } from '@popup/shared/utils/transaction-helpers';

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

type Props = {
    /** The title for the configuriation step */
    title: string;
    /** The initial values of the step, if any */
    initialValues?: DelegatorStakeForm;
    /** The delegation target of the transaction */
    target: DelegationTypeForm;
    /** The calculated fee for the transaction */
    fee: CcdAmount.Type;
    /** The submit handler triggered when submitting the form in the step */
    onSubmit(values: DelegatorStakeForm): void;
};

export default function DelegatorStake({ title, target, fee, initialValues, onSubmit }: Props) {
    const { t } = useTranslation('x', { keyPrefix: 'earn.delegator.stake' });
    const form = useForm<DelegatorStakeForm>({
        defaultValues: initialValues ?? { amount: '0.00', redelegate: true },
    });
    const submit = form.handleSubmit(onSubmit);
    const selectedCred = useSelectedCredential();
    const selectedAccountInfo = useAccountInfo(selectedCred);

    if (selectedAccountInfo === undefined || selectedCred === undefined || fee === undefined) {
        return null;
    }

    return (
        <Page className="register-delegator-container">
            <Page.Top heading={title} />
            <Text.Capture className="m-l-5 m-t-neg-5">
                {t('selectedAccount', { account: displayNameAndSplitAddress(selectedCred) })}
            </Text.Capture>
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
                                <Text.Main>{t('redelegate.label')}</Text.Main>
                                <FormToggleCheckbox register={f.register} name="redelegate" />
                            </div>
                            <Text.Capture>{t('redelegate.description')}</Text.Capture>
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
