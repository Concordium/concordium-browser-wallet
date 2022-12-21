import { ConfigureDelegationPayload, DelegationTargetType } from '@concordium/web-sdk';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { displayAsCcd } from 'wallet-common-helpers';

import OptionalField from './OptionalField';

type Props = {
    payload: ConfigureDelegationPayload;
};

export default function DisplayConfigureDelegation({ payload }: Props) {
    const { t } = useTranslation('shared', { keyPrefix: 'transactionReceipt' });

    return (
        <>
            <OptionalField title={t('configureDelegation.target')} value={payload.delegationTarget}>
                {(f) =>
                    f.delegateType === DelegationTargetType.Baker
                        ? f.bakerId.toString()
                        : t('configureDelegation.passiveDelegation')
                }
            </OptionalField>
            <OptionalField title={t('amount')} value={payload.stake}>
                {(f) => displayAsCcd(f.microCcdAmount)}
            </OptionalField>
            <OptionalField title={t('configureDelegation.redelegate')} value={payload.restakeEarnings}>
                {(f) => (f ? t('configureDelegation.redelegateOption') : t('configureDelegation.noRedelegateOption'))}
            </OptionalField>
        </>
    );
}
