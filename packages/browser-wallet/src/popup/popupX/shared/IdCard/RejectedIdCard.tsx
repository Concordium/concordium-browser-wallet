import React from 'react';
import Close from '@assets/svgX/close.svg';
import { identityProvidersAtom } from '@popup/store/identity';
import { useAtomValue } from 'jotai';
import { RejectedIdentity } from '@shared/storage/types';
import { useTranslation } from 'react-i18next';
import Text from '@popup/popupX/shared/Text';
import IdCard from './IdCard';

export type RejectedIdentityProps = {
    /** Identity to show. */
    identity: RejectedIdentity;
};

export default function RejectedIdCard({ identity }: RejectedIdentityProps) {
    const { t } = useTranslation('x', { keyPrefix: 'sharedX' });
    const providers = useAtomValue(identityProvidersAtom);
    const provider = providers.find((p) => p.ipInfo.ipIdentity === identity.providerIndex);
    const idProviderName = provider?.ipInfo.ipDescription.name ?? 'Unknown';
    return (
        <IdCard title={identity.name} subtitle={t('idCard.rejectedBy', { idProviderName })}>
            <IdCard.Content className="rejected">
                <Close className="icon-rejected" />
                <Text.MainRegular>{t('idCard.itentityRejected')}</Text.MainRegular>
                <Text.MainMedium>{identity.error}</Text.MainMedium>
            </IdCard.Content>
        </IdCard>
    );
}
