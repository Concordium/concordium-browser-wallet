import React from 'react';
import { identityProvidersAtom } from '@popup/store/identity';
import { useAtomValue } from 'jotai';
import { PendingIdentity } from '@shared/storage/types';
import { useTranslation } from 'react-i18next';
import Text from '@popup/popupX/shared/Text';
import IdCard from './IdCard';

export type PendingIdentityProps = {
    /** Identity to show. */
    identity: PendingIdentity;
};

export default function PendingIdCard({ identity }: PendingIdentityProps) {
    const { t } = useTranslation('x', { keyPrefix: 'sharedX' });
    const providers = useAtomValue(identityProvidersAtom);
    const provider = providers.find((p) => p.ipInfo.ipIdentity === identity.providerIndex);
    const idProviderName = provider?.ipInfo.ipDescription.name ?? 'Unknown';
    return (
        <IdCard title={identity.name} subtitle={t('idCard.pendingBy', { idProviderName })} identityType={identity.type}>
            <IdCard.Content>
                <IdCard.ContentRow>
                    <Text.MainRegular>...</Text.MainRegular>
                </IdCard.ContentRow>
                <IdCard.ContentRow>
                    <Text.MainRegular>...</Text.MainRegular>
                </IdCard.ContentRow>
            </IdCard.Content>
        </IdCard>
    );
}
