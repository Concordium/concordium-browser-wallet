import { ConfigureBakerPayload } from '@concordium/web-sdk';
import DisplayPartialString from '@popup/shared/DisplayPartialString';
import { displayFractionCommissionRate, openStatusToDisplay } from '@popup/shared/utils/baking-helpers';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { chunkString, displayAsCcd } from 'wallet-common-helpers';

import OptionalField from './OptionalField';

type Props = {
    payload: ConfigureBakerPayload;
};

interface KeyProps {
    value: string;
}

export function DisplayKey({ value }: KeyProps) {
    return <div className="transaction-receipt__value mono">{chunkString(value, 32).join('\n')}</div>;
}

export default function DisplayConfigureBaker({ payload }: Props) {
    const { t } = useTranslation('shared', { keyPrefix: 'baking' });

    return (
        <>
            <OptionalField title={t('amount')} value={payload.stake}>
                {(f) => displayAsCcd(f.microCcdAmount)}
            </OptionalField>
            <OptionalField title={t('restake')} value={payload.restakeEarnings}>
                {(f) => (f ? t('restakeOption') : t('noRestakeOption'))}
            </OptionalField>
            <OptionalField title={t('openForDelegation')} value={payload.openForDelegation}>
                {(f) => openStatusToDisplay(f)}
            </OptionalField>
            <OptionalField title={t('transactionCommission')} value={payload.transactionFeeCommission}>
                {displayFractionCommissionRate}
            </OptionalField>
            <OptionalField title={t('bakingCommission')} value={payload.bakingRewardCommission}>
                {displayFractionCommissionRate}
            </OptionalField>
            <OptionalField title={t('finalizationCommission')} value={payload.finalizationRewardCommission}>
                {displayFractionCommissionRate}
            </OptionalField>
            <OptionalField title={t('metadataUrl')} value={payload.metadataUrl}>
                {(url) => (url === '' ? t('noUrl') : <DisplayPartialString className="word-break-all" value={url} />)}
            </OptionalField>
            <OptionalField title={t('electionKey')} value={payload.keys?.electionVerifyKey}>
                {(k) => <DisplayKey value={k} />}
            </OptionalField>
            <OptionalField title={t('signatureKey')} value={payload.keys?.signatureVerifyKey}>
                {(k) => <DisplayKey value={k} />}
            </OptionalField>
            <OptionalField title={t('aggregationKey')} value={payload.keys?.aggregationVerifyKey}>
                {(k) => <DisplayKey value={k} />}
            </OptionalField>
        </>
    );
}
