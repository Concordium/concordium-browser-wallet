import React, { useCallback } from 'react';
import { AccountTransactionType } from '@concordium/web-sdk';

import Button from '@popup/shared/Button';
import { ensureDefined } from '@shared/utils/basic-helpers';
import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';

import { Trans, useTranslation } from 'react-i18next';
import Form, { useForm } from '@popup/shared/Form';
import { MultiStepFormPageProps } from '@popup/shared/MultiStepForm';
import Submit from '@popup/shared/Form/Submit';
import { FormRadios } from '@popup/shared/Form/Radios/Radios';
import FormInput from '@popup/shared/Form/Input';
import ExternalLink from '@popup/shared/ExternalLink';
import AccountTransactionFlow from '../../AccountTransactionFlow';
import { configureDelegationChangesPayload, ConfigureDelegationFlowState } from './utils';

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
    const form = useForm<PoolPageForm>({
        defaultValues:
            initial === null || initial === undefined ? { isBaker: false } : { isBaker: true, bakerId: initial },
    });
    const isBakerValue = form.watch('isBaker');

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
                            rules={{ required: true }}
                        />
                        <div className="m-t-10">
                            {isBakerValue ? (
                                <>
                                    <FormInput
                                        register={f.register}
                                        name="bakerId"
                                        label={t('pool.bakerIdLabel')}
                                        rules={{ required: t('pool.bakerIdRequired') }} // TODO validate baker ID exists.
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
                    <Submit>{t('continueButton')}</Submit>
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
                    render: (_, onNext) => (
                        <div>
                            Settings
                            <br />
                            <Button onClick={() => onNext({ amount: '1', redelegate: true })}>Next</Button>
                        </div>
                    ),
                },
            }}
        </AccountTransactionFlow>
    );
}
