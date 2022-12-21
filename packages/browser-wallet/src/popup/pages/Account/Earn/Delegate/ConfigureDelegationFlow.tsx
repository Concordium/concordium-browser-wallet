import React, { useCallback, useMemo } from 'react';
import { AccountTransactionType } from '@concordium/web-sdk';

import { ensureDefined } from '@shared/utils/basic-helpers';
import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';

import { Trans, useTranslation } from 'react-i18next';
import Form, { useForm } from '@popup/shared/Form';
import { MultiStepFormPageProps } from '@popup/shared/MultiStepForm';
import Submit from '@popup/shared/Form/Submit';
import { FormRadios } from '@popup/shared/Form/Radios/Radios';
import FormInput from '@popup/shared/Form/Input';
import ExternalLink from '@popup/shared/ExternalLink';
import { Validate } from 'react-hook-form';
import FormAmountInput from '@popup/shared/Form/AmountInput';
import { getCcdSymbol } from 'wallet-common-helpers';
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
                            className="m-t-10 w-full"
                            control={f.control}
                            name="isBaker"
                            options={[
                                { value: true, label: t('pool.optionBaker') },
                                { value: false, label: t('pool.optionPassive') },
                            ]}
                        />
                        <div className="m-t-10">
                            {isBakerValue ? (
                                <>
                                    <FormInput
                                        register={f.register}
                                        name="bakerId"
                                        label={t('pool.bakerIdLabel')}
                                        rules={{ required: t('pool.bakerIdRequired'), validate: validateBakerId }}
                                    />
                                    <br />
                                    <Trans
                                        ns="account"
                                        i18nKey="delegate.configure.pool.descriptionBaker"
                                        components={{
                                            1: (
                                                <ExternalLink path="https://developer.concordium.software/en/mainnet/net/concepts/concepts-delegation.html" />
                                            ),
                                        }}
                                    />
                                </>
                            ) : (
                                <Trans
                                    ns="account"
                                    i18nKey="delegate.configure.pool.descriptionPassive"
                                    components={{
                                        1: (
                                            <ExternalLink path="https://developer.concordium.software/en/mainnet/net/concepts/concepts-delegation.html" />
                                        ),
                                    }}
                                />
                            )}
                        </div>
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
    const defaultValues: AmountPageForm = useMemo(() => initial ?? { amount: '0', redelegate: true }, [initial]);

    return (
        <Form<AmountPageForm> className="configure-flow-form" defaultValues={defaultValues} onSubmit={onNext}>
            {(f) => (
                <>
                    <div>
                        <FormAmountInput
                            label={t('amount.amountLabel')}
                            register={f.register}
                            symbol={getCcdSymbol()}
                            name="amount"
                            rules={{ required: t('amount.amountRequired') }}
                        />
                        {/* TODO: display current stake in pool + max stake */}
                        <FormRadios
                            className="m-t-10 w-full"
                            control={f.control}
                            name="redelegate"
                            options={[
                                { value: true, label: t('amount.optionRedelegate') },
                                { value: false, label: t('amount.optionNoRedelegate') },
                            ]}
                            rules={{ required: true }}
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
