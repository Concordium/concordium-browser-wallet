import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

import { absoluteRoutes } from '@popup/popupX/constants/routes';
import Button from '@popup/popupX/shared/Button';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import IdentityProviderIcon from '@popup/shared/IdentityProviderIcon';
import ExternalLink from '@assets/svgX/UiKit/Interface/external-link.svg';
import CircleInfo from '@assets/svgX/UiKit/Interface/circled-info-tootlip.svg';
import { getIdentityProviders } from '@popup/shared/utils/wallet-proxy';
import { identitiesAtom, identityProvidersAtom, pendingIdentityAtom } from '@popup/store/identity';
import { grpcClientAtom, hasBeenOnBoardedAtom, networkConfigurationAtom } from '@popup/store/settings';
import { CreationStatus, IdentityProvider, SessionPendingIdentity } from '@shared/storage/types';
import { getGlobal } from '@shared/utils/network-helpers';
import { logErrorMessage } from '@shared/utils/log-helpers';

import { IdCardsInfoNotice } from './IdCardsInfo';
import { IdIssuanceExternalFlowLocationState } from './util';

export default function IdIssuance() {
    const { t } = useTranslation('x', { keyPrefix: 'idIssuance.idIssuer' });
    const [providers, setProviders] = useAtom(identityProvidersAtom);
    const network = useAtomValue(networkConfigurationAtom);
    const identities = useAtomValue(identitiesAtom);
    const client = useAtomValue(grpcClientAtom);
    const nav = useNavigate();
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const [pendingIdentity, setPendingIdentity] = useAtom(pendingIdentityAtom);
    const [showIdInfo, setShowIdInfo] = useState(false);
    const setHasBeenOnboarded = useSetAtom(hasBeenOnBoardedAtom);

    useEffect(() => {
        // TODO: only load once per session?
        getIdentityProviders()
            .then(setProviders)
            // eslint-disable-next-line no-console
            .catch(() => logErrorMessage('Unable to update identity provider list'));
    }, []);

    const startIssuance = useCallback(
        async (provider: IdentityProvider) => {
            // Component was reused at onboarding. Needs to set value here.
            setHasBeenOnboarded(true);

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

                const identity: SessionPendingIdentity = {
                    identity: {
                        status: CreationStatus.Pending,
                        index: identityIndex,
                        name: `Identity ${identities.length + 1}`,
                        providerIndex,
                    },
                    network,
                };

                const issuanceParams: IdIssuanceExternalFlowLocationState = {
                    global,
                    provider,
                    pendingIdentity: identity,
                };
                nav(absoluteRoutes.settings.identities.create.externalFlow.path, { state: issuanceParams });
            } catch {
                setButtonDisabled(false);
            }
        },
        [network]
    );

    return (
        <>
            <IdCardsInfoNotice open={showIdInfo} onClose={() => setShowIdInfo(false)} />
            <Page className="id-issuance">
                <Page.Top heading={t('title')}>
                    <Button.Icon
                        icon={<CircleInfo />}
                        onClick={() => {
                            setShowIdInfo(true);
                        }}
                    />
                </Page.Top>
                {pendingIdentity !== undefined ? (
                    <Text.Capture>{t('descriptionOngoing')}</Text.Capture>
                ) : (
                    <Text.Capture>{t('description')}</Text.Capture>
                )}
                {pendingIdentity === undefined && (
                    <>
                        <div className="id-issuance__providers-container">
                            {providers.map((p) => (
                                <Button.Base
                                    className="id-issuance__issuer-btn"
                                    key={p.ipInfo.ipDescription.url}
                                    disabled={buttonDisabled}
                                    onClick={() => startIssuance(p)}
                                >
                                    <IdentityProviderIcon provider={p} />
                                    <Text.Main>{p.metadata.display ?? p.ipInfo.ipDescription.name}</Text.Main>
                                    <ExternalLink />
                                </Button.Base>
                            ))}
                        </div>
                        <Text.Capture className="redirect-info">{t('redirectInfo')}</Text.Capture>
                    </>
                )}
                {pendingIdentity !== undefined && (
                    <Page.Footer>
                        <Button.Main label={t('buttonReset')} onClick={() => setPendingIdentity(undefined)} />
                    </Page.Footer>
                )}
            </Page>
        </>
    );
}
