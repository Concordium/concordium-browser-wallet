import { ConfigureDelegationPayload, DelegationTargetType } from '@concordium/web-sdk';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { displayAsCcd } from 'wallet-common-helpers';

import OptionalField from './OptionalField';

type Props = {
    payload: ConfigureDelegationPayload;
};

export default function DisplayConfigureDelegation({ payload }: Props) {
    const { t } = useTranslation('shared', { keyPrefix: 'delegation' });

    return (
        <>
            <OptionalField title={t('target')} value={payload.delegationTarget}>
                {(f) =>
                    f.delegateType === DelegationTargetType.Baker
                        ? t('targetBaker', { bakerId: f.bakerId.toString() })
                        : t('targetPassive')
                }
            </OptionalField>
            <OptionalField title={t('amount')} value={payload.stake}>
                {(f) => displayAsCcd(f.microCcdAmount)}
            </OptionalField>
            <OptionalField title={t('redelegate')} value={payload.restakeEarnings}>
                {(f) => (f ? t('redelegateOption') : t('noRedelegateOption'))}
            </OptionalField>
        </>
    );
}
