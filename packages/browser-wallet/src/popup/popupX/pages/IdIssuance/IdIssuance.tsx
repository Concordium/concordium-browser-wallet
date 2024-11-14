import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { absoluteRoutes } from '@popup/popupX/constants/routes';
import Button from '@popup/popupX/shared/Button';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import IdentityProviderIcon from '@popup/shared/IdentityProviderIcon';
import { getIdentityProviders } from '@popup/shared/utils/wallet-proxy';
import { identitiesAtom, identityProvidersAtom, pendingIdentityAtom } from '@popup/store/identity';
import { grpcClientAtom, networkConfigurationAtom } from '@popup/store/settings';
import { CreationStatus, IdentityProvider } from '@shared/storage/types';
import { getGlobal, getNet } from '@shared/utils/network-helpers';
import { IdIssuanceExternalFlowLocationState } from './ExternalFlow';

export default function IdIssuance() {
    const { t } = useTranslation('x', { keyPrefix: 'idIssuance.idIssuer' });
    const [providers, setProviders] = useAtom(identityProvidersAtom);
    const network = useAtomValue(networkConfigurationAtom);
    const identities = useAtomValue(identitiesAtom);
    const updatePendingIdentity = useSetAtom(pendingIdentityAtom);
    const client = useAtomValue(grpcClientAtom);
    const nav = useNavigate();
    const [buttonDisabled, setButtonDisabled] = useState(false);

    useEffect(() => {
        // TODO: only load once per session?
        getIdentityProviders()
            .then(setProviders)
            // eslint-disable-next-line no-console
            .catch(() => console.error('Unable to update identity provider list')); // TODO: log error
    }, []);

    const startIssuance = useCallback(
        async (provider: IdentityProvider) => {
            setButtonDisabled(true);
            try {
                if (!network) {
                    throw new Error('Network is not specified');
                }

                const global = await getGlobal(client);
                const providerIndex = provider.ipInfo.ipIdentity;
                const identityIndex = identities.reduce(
                    (maxIndex, identity) =>
                        identity.providerIndex === providerIndex ? Math.max(maxIndex, identity.index + 1) : maxIndex,
                    0
                );

                updatePendingIdentity({
                    identity: {
                        status: CreationStatus.Pending,
                        index: identityIndex,
                        name: `Identity ${identities.length + 1}`,
                        providerIndex,
                    },
                    network,
                });

                const issuanceParams: IdIssuanceExternalFlowLocationState = {
                    globalContext: global,
                    ipInfo: provider.ipInfo,
                    arsInfos: provider.arsInfos,
                    net: getNet(network),
                    identityIndex,
                    arThreshold: Math.min(Object.keys(provider.arsInfos).length - 1, 255),
                    baseUrl: provider.metadata.issuanceStart,
                };
                nav(absoluteRoutes.settings.identities.create.externalFlow.path, { state: issuanceParams });
            } catch {
                setButtonDisabled(false);
            }
        },
        [network]
    );

    return (
        <Page>
            <Page.Top heading={t('title')} />
            <Text.Capture>{t('description')}</Text.Capture>
            <div className="m-t-20">
                {providers.map((p) => (
                    <Button.Base
                        className="id-issuance__issuer-btn"
                        key={p.ipInfo.ipDescription.url}
                        disabled={buttonDisabled}
                        onClick={() => startIssuance(p)}
                    >
                        <IdentityProviderIcon provider={p} />
                        <span>{p.metadata.display ?? p.ipInfo.ipDescription.name}</span>
                    </Button.Base>
                ))}
            </div>
        </Page>
    );
}
