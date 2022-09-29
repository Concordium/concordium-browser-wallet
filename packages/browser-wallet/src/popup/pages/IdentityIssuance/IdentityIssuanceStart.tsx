import React, { useState, useEffect, useCallback } from 'react';
import { useAtomValue, useAtom, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { networkConfigurationAtom } from '@popup/store/settings';
import { pendingIdentityAtom, identitiesAtom, identityProvidersAtom } from '@popup/store/identity';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { getIdentityProviders } from '@popup/shared/utils/wallet-proxy';
import { InternalMessageType } from '@concordium/browser-wallet-message-hub';
import { CreationStatus, IdentityProvider } from '@shared/storage/types';
import Button from '@popup/shared/Button';
import IdentityProviderIcon from '@popup/shared/IdentityProviderIcon';
import PendingArrows from '@assets/svg/pending-arrows.svg';
import { getGlobal, getNet } from '@shared/utils/network-helpers';
import { addToastAtom } from '@popup/state';
import { useDecryptedSeedPhrase } from '@popup/shared/utils/seed-phrase-helpers';

interface InnerProps {
    onStart: () => void;
}

function IdentityIssuanceStart({ onStart }: InnerProps) {
    const { t } = useTranslation('identityIssuance');
    const [providers, setProviders] = useAtom(identityProvidersAtom);
    const network = useAtomValue(networkConfigurationAtom);
    const updatePendingIdentity = useSetAtom(pendingIdentityAtom);
    const identities = useAtomValue(identitiesAtom);
    const [buttonDisabled, setButtonDisabled] = useState(false);
    const addToast = useSetAtom(addToastAtom);
    const seedPhrase = useDecryptedSeedPhrase((e) => addToast(e.message));

    useEffect(() => {
        // TODO only load once per session?
        getIdentityProviders()
            .then((loadedProviders) => setProviders(loadedProviders))
            .catch(() => addToast('Unable to update identity provider list'));
    }, []);

    const startIssuance = useCallback(
        async (provider: IdentityProvider) => {
            setButtonDisabled(true);
            try {
                if (!network) {
                    throw new Error('Network is not specified');
                }
                if (!seedPhrase) {
                    return;
                }

                const global = await getGlobal(network);

                const providerIndex = provider.ipInfo.ipIdentity;

                const identityIndex = identities.reduce(
                    (maxIndex, identity) =>
                        identity.providerIndex === providerIndex ? Math.max(maxIndex, identity.index + 1) : maxIndex,
                    0
                );

                updatePendingIdentity({
                    status: CreationStatus.Pending,
                    index: identityIndex,
                    name: `Identity ${identities.length + 1}`,
                    providerIndex,
                });

                onStart();

                popupMessageHandler.sendInternalMessage(InternalMessageType.StartIdentityIssuance, {
                    globalContext: global,
                    ipInfo: provider.ipInfo,
                    arsInfos: provider.arsInfos,
                    seed: seedPhrase,
                    net: getNet(network),
                    identityIndex,
                    arThreshold: Math.min(Object.keys(provider.arsInfos).length - 1, 255),
                    baseUrl: provider.metadata.issuanceStart,
                });
            } finally {
                setButtonDisabled(false);
            }
        },
        [network, seedPhrase]
    );

    return (
        <div className="identity-issuance__start">
            <p className="identity-issuance__start-text">{t('startText')}</p>
            <div>
                {providers.map((p) => (
                    <Button
                        className="identity-issuance__provider-button flex justify-space-between align-center"
                        width="wide"
                        disabled={buttonDisabled}
                        key={p.ipInfo.ipIdentity + p.ipInfo.ipDescription.name}
                        onClick={() => startIssuance(p).catch((e) => addToast(e.toString()))}
                    >
                        <IdentityProviderIcon provider={p} />
                        {p.ipInfo.ipDescription.name}
                    </Button>
                ))}
            </div>
        </div>
    );
}

export default function IdentityIssuanceStartGuard() {
    const { t } = useTranslation('identityIssuance');
    const [pendingIdentity, setPendingidentity] = useAtom(pendingIdentityAtom);
    const [blocked, setBlocked] = useState(false);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        if (pendingIdentity && !started) {
            setBlocked(true);
        }
    }, [pendingIdentity]);

    if (blocked) {
        return (
            <div className="identity-issuance__start">
                <p className="identity-issuance__start-text">{t('alreadyPending')}</p>
                <Button
                    width="wide"
                    onClick={() => {
                        setPendingidentity(undefined);
                        setBlocked(false);
                    }}
                >
                    {t('reset')}
                </Button>
            </div>
        );
    }
    if (started) {
        return (
            <div className="identity-issuance__start">
                <p className="identity-issuance__start-text">{t('startText')}</p>
                <PendingArrows className="identity-issuance__start__loading-arrows" />
                <p className="identity-issuance__text m-t-40">{t('startWaitingText')}</p>
            </div>
        );
    }
    return <IdentityIssuanceStart onStart={() => setStarted(true)} />;
}
