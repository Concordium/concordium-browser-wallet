import React, { useState, useEffect } from 'react';
import { useAtomValue, useAtom, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { networkConfigurationAtom, seedPhraseAtom } from '@popup/store/settings';
import { pendingIdentityAtom, identitiesAtom, identityProvidersAtom } from '@popup/store/identity';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { getIdentityProviders } from '@popup/shared/utils/wallet-proxy';
import { InternalMessageType } from '@concordium/browser-wallet-message-hub';
import { JsonRpcClient, HttpProvider } from '@concordium/web-sdk';
import { CreationStatus, IdentityProvider } from '@shared/storage/types';
import Button from '@popup/shared/Button';
import IdentityProviderIcon from '@popup/shared/IdentityProviderIcon';
import PendingArrows from '@assets/svg/pending-arrows.svg';
import { getNet } from '@shared/utils/network-helpers';

interface InnerProps {
    onStart: () => void;
}

function IdentityIssuanceStart({ onStart }: InnerProps) {
    const { t } = useTranslation('identityIssuance');
    const [providers, setProviders] = useAtom(identityProvidersAtom);
    const network = useAtomValue(networkConfigurationAtom);
    const updatePendingIdentity = useSetAtom(pendingIdentityAtom);
    const identities = useAtomValue(identitiesAtom);
    const seedPhrase = useAtomValue(seedPhraseAtom);
    const [error, setError] = useState<string>();
    const [buttonDisabled, setButtonDisabled] = useState(false);

    useEffect(() => {
        // TODO only load once per session?
        getIdentityProviders().then((loadedProviders) => setProviders(loadedProviders));
    }, []);

    const startIssuance = async (provider: IdentityProvider) => {
        setButtonDisabled(true);
        try {
            if (!network) {
                throw new Error('Network is not specified');
            }
            if (!seedPhrase) {
                throw new Error('no seed phrase');
            }

            // TODO: Maybe we should not create the client for each page
            const client = new JsonRpcClient(new HttpProvider(network.jsonRpcUrl));

            const global = await client.getCryptographicParameters();

            if (!global) {
                throw new Error('no global fetched');
            }

            // TODO Find a better way to assign indices
            const identityIndex = identities.length ? identities[identities.length - 1].index + 1 : 0;

            onStart();

            updatePendingIdentity({
                status: CreationStatus.Pending,
                index: identityIndex,
                name: `Identity ${identityIndex + 1}`,
                provider: provider.ipInfo.ipIdentity,
            });

            popupMessageHandler.sendInternalMessage(InternalMessageType.StartIdentityIssuance, {
                globalContext: global.value,
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
    };

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
                        onClick={() => startIssuance(p).catch((e) => setError(e.toString()))}
                    >
                        <IdentityProviderIcon provider={p} />
                        {p.ipInfo.ipDescription.name}
                    </Button>
                ))}
            </div>
            {error && (
                <p className="identity-issuance__error m-t-20">
                    {t('error')}: {error}
                </p>
            )}
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
