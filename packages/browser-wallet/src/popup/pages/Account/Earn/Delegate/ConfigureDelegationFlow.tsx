import React, { useCallback, useMemo } from 'react';
import { AccountTransactionType } from '@concordium/web-sdk';
import { Trans, useTranslation } from 'react-i18next';
import { getCcdSymbol, useUpdateEffect } from 'wallet-common-helpers';
import { Validate } from 'react-hook-form';

import { ensureDefined } from '@shared/utils/basic-helpers';
import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import Form, { useForm } from '@popup/shared/Form';
import { MultiStepFormPageProps } from '@popup/shared/MultiStepForm';
import Submit from '@popup/shared/Form/Submit';
import { FormRadios } from '@popup/shared/Form/Radios/Radios';
import FormInput from '@popup/shared/Form/Input';
import ExternalLink from '@popup/shared/ExternalLink';
import FormAmountInput from '@popup/shared/Form/AmountInput';
import { configureDelegationChangesPayload, ConfigureDelegationFlowState } from './utils';
import AccountTransactionFlow from '../../AccountTransactionFlow';

type PoolPageForm =
    | {
          isBaker: false;
      }
    | {
          isBaker: true;
          bakerId: string;
      };

type PoolPageProps = Omit<
    MultiStepFormPageProps<ConfigureDelegationFlowState['pool'], ConfigureDelegationFlowState>,
    'formValues'
>;

function PoolPage({ onNext, initial }: PoolPageProps) {
    const { t } = useTranslation('account', { keyPrefix: 'delegate.configure' });
    // const rpc = useAtomValue(jsonRpcClientAtom);
    const form = useForm<PoolPageForm>({
        defaultValues:
            initial === null || initial === undefined ? { isBaker: false } : { isBaker: true, bakerId: initial },
    });
    const isBakerValue = form.watch('isBaker');

    const validateBakerId: Validate<string | boolean> = async (value) => {
        try {
            const bakerId = BigInt(value);
            // eslint-disable-next-line no-console
            console.log(bakerId);
            // const poolStatus = await rpc.getPoolStatus(bakerId); // TODO: Doesn't exist yet...

            // if (poolStatus.poolInfo.openStatus !== OpenStatusText.OpenForAll) {
            //     return 'Targeted baker does not allow new delegators'; // TODO: translate
            // }

            // if (
            //     isDelegatorAccount(accountInfo) &&
            //     poolStatus.delegatedCapitalCap - poolStatus.delegatedCapital <
            //         accountInfo.accountDelegation.stakedAmount
            // ) {
            //     return "Your current stake would violate the targeted baker's cap"; // TODO: translate
            // }

            return true;
        } catch {
            return "Supplied baker ID doesn't match an active baker.";
        }
    };

    useUpdateEffect(() => {
        if (!isBakerValue) {
            form.resetField('bakerId');
        }
    }, [isBakerValue]);

    const onSubmit = (vs: PoolPageForm) => {
        if (vs.isBaker) {
            onNext(vs.bakerId);
        } else {
            onNext(null);
        }
    };

    return (
        <Form<PoolPageForm> className="configure-flow-form" formMethods={form} onSubmit={onSubmit}>
            {(f) => (
                <>
                    <div>
                        {t('pool.description1')}
                        <FormRadios
                            className="m-t-20 w-full"
                            control={f.control}
                            name="isBaker"
                            options={[
                                { value: true, label: t('pool.optionBaker') },
                                { value: false, label: t('pool.optionPassive') },
                            ]}
                        />
                        {isBakerValue ? (
                            <>
                                <FormInput
                                    className="m-t-10"
                                    register={f.register}
                                    name="bakerId"
                                    label={t('pool.bakerIdLabel')}
                                    autoFocus
                                    rules={{ required: t('pool.bakerIdRequired'), validate: validateBakerId }}
                                />
                                <div className="m-t-20">
                                    <Trans
                                        ns="account"
                                        i18nKey="delegate.configure.pool.descriptionBaker"
                                        components={{
                                            1: (
                                                <ExternalLink path="https://developer.concordium.software/en/mainnet/net/concepts/concepts-delegation.html" />
                                            ),
                                        }}
                                    />
                                </div>
                            </>
                        ) : (
                            <div className="m-t-20">
                                <Trans
                                    ns="account"
                                    i18nKey="delegate.configure.pool.descriptionPassive"
                                    components={{
                                        1: (
                                            <ExternalLink path="https://developer.concordium.software/en/mainnet/net/concepts/concepts-delegation.html" />
                                        ),
                                    }}
                                />
                            </div>
                        )}
                    </div>
                    <Submit className="m-t-20">{t('continueButton')}</Submit>
                </>
            )}
        </Form>
    );
}

type AmountPageForm = {
    amount: string;
    redelegate: boolean;
};

type AmountPageProps = MultiStepFormPageProps<ConfigureDelegationFlowState['amount'], ConfigureDelegationFlowState>;

function AmountPage({ initial, onNext }: AmountPageProps) {
    const { t } = useTranslation('account', { keyPrefix: 'delegate.configure' });
    const defaultValues: Partial<AmountPageForm> = useMemo(() => initial ?? { redelegate: true }, [initial]);

    return (
        <Form<AmountPageForm> className="configure-flow-form" defaultValues={defaultValues} onSubmit={onNext}>
            {(f) => (
                <>
                    <div>
                        <FormAmountInput
                            label={t('amount.amountLabel')}
                            autoFocus
                            register={f.register}
                            symbol={getCcdSymbol()}
                            name="amount"
                            rules={{ required: t('amount.amountRequired') }} // TODO validate amount
                        />
                        {/* TODO: display current stake in pool + max stake */}
                        <div className="m-t-20">{t('amount.descriptionRedelegate')}</div>
                        <FormRadios
                            className="m-t-20 w-full"
                            control={f.control}
                            name="redelegate"
                            options={[
                                { value: true, label: t('amount.optionRedelegate') },
                                { value: false, label: t('amount.optionNoRedelegate') },
                            ]}
                        />
                    </div>
                    <Submit className="m-t-20">{t('continueButton')}</Submit>
                </>
            )}
        </Form>
    );
}

type Props = {
    title: string;
    firstPageBack?: boolean;
};

export default function ConfigureDelegationFlow(props: Props) {
    const accountInfo = ensureDefined(useSelectedAccountInfo(), 'Assumed account info to be available');
    const valuesToPayload = useCallback(configureDelegationChangesPayload(accountInfo), [accountInfo]);

    return (
        <AccountTransactionFlow<ConfigureDelegationFlowState>
            {...props}
            convert={valuesToPayload}
            transactionType={AccountTransactionType.ConfigureDelegation}
        >
            {{
                pool: {
                    render: (initial, onNext) => <PoolPage initial={initial} onNext={onNext} />,
                },
                amount: {
                    render: (initial, onNext, formValues) => (
                        <AmountPage initial={initial} onNext={onNext} formValues={formValues} />
                    ),
                },
            }}
        </AccountTransactionFlow>
    );
}
