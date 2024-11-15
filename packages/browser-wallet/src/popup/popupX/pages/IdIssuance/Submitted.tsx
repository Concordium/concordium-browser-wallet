import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

import Button from '@popup/popupX/shared/Button';
import IdCard from '@popup/popupX/shared/IdCard';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import { useAtomValue } from 'jotai';
import { identitiesAtom, identityProvidersAtom } from '@popup/store/identity';
import { CreationStatus } from '@shared/storage/types';

export default function IdIssuanceSubmitted() {
    const { t } = useTranslation('x', { keyPrefix: 'idIssuance.submitted' });
    const providers = useAtomValue(identityProvidersAtom);
    const identity = useAtomValue(identitiesAtom).slice(-1)[0];
    const provider = useMemo(
        () => providers.find((p) => p.ipInfo.ipIdentity === identity.providerIndex),
        [identity.providerIndex]
    );

    if (provider === undefined) {
        return null;
    }

    const providerName = provider.metadata.display ?? provider.ipInfo.ipDescription.name;

    return (
        <Page>
            <Page.Top heading={t('title')} />
            <Text.Capture>{t('description')}</Text.Capture>
            {identity.status === CreationStatus.Pending && (
                <IdCard className="m-t-20" idProviderName={providerName} identityName={identity.name} />
            )}
            {identity.status === CreationStatus.Rejected && (
                <IdCard className="m-t-20" idProviderName={providerName} identityName={identity.name} />
            )}
            {identity.status === CreationStatus.Confirmed && (
                <IdCard className="m-t-20" idProviderName={providerName} identityName={identity.name} />
            )}
            <Page.Footer>
                <Button.Main className="m-t-20" label={t('buttonContinue')} />
            </Page.Footer>
        </Page>
    );
}
