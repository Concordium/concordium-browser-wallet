import React, { useState, useEffect } from 'react';
import { useAtomValue, useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { jsonRpcUrlAtom, seedPhraseAtom } from '@popup/store/settings';
import { pendingIdentityAtom, identitiesAtom, identityProvidersAtom } from '@popup/store/identity';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { getIdentityProviders, IdentityProvider } from '@shared/utils/wallet-proxy';
import { InternalMessageType } from '@concordium/browser-wallet-message-hub';
import { JsonRpcClient, HttpProvider } from '@concordium/web-sdk';
import { IdentityStatus, Network } from '@shared/storage/types';
import Button from '@popup/shared/Button';

function IdentityIssuanceStart() {
    const { t } = useTranslation('identityIssuance');
    const [providers, setProviders] = useAtom(identityProvidersAtom);
    const jsonRrcUrl = useAtomValue(jsonRpcUrlAtom);
    const [, updatePendingIdentity] = useAtom(pendingIdentityAtom);
    const identities = useAtomValue(identitiesAtom);
    const masterSeed = useAtomValue(seedPhraseAtom);
    const [started, setStarted] = useState(false);

    useEffect(() => {
        // TODO only load once per session?
        getIdentityProviders().then((loadedProviders) => setProviders(loadedProviders));
    }, []);

    const startIssuance = async (provider: IdentityProvider) => {
        if (!jsonRrcUrl) {
            throw new Error('no json rpc url');
        }
        if (!masterSeed) {
            throw new Error('no master seed');
        }

        // TODO: Maybe we should not create the client for each page
        const client = new JsonRpcClient(new HttpProvider(jsonRrcUrl));
        const global = await client.getCryptographicParameters();

        if (!global) {
            throw new Error('no global fetched');
        }

        // TODO Find a better way to assign indices
        const identityIndex = identities.length ? identities[identities.length - 1].index + 1 : 0;
        // TODO Get this from settings, when we store the chosen net
        const net = 'Testnet';

        updatePendingIdentity({
            id: identities.length,
            status: IdentityStatus.Pending,
            index: identityIndex,
            name: `Identity ${identities.length}`,
            network: Network[net],
            provider: provider.ipInfo.ipIdentity,
        });

        setStarted(true);

        popupMessageHandler.sendInternalMessage(InternalMessageType.StartIdentityIssuance, {
            globalContext: global.value,
            ipInfo: provider.ipInfo,
            arsInfos: provider.arsInfos,
            seed: masterSeed,
            net,
            identityIndex,
            arThreshold: 1,
            baseUrl: provider.metadata.issuanceStart,
        });
    };

    if (started) {
        // TODO: make nice
        return (
            <div className="identity-issuance__start">
                <p className="identity-issuance__text">{t('startText')}</p>
                <p className="identity-issuance__text m-t-20">{t('startWaitingText')}</p>
            </div>
        );
    }

    return (
        <div className="identity-issuance__start">
            <p className="identity-issuance__text">{t('startText')}</p>
            {providers.map((p) => (
                <Button
                    className="identity-issuance__provider-button"
                    width="wide"
                    key={p.ipInfo.ipIdentity}
                    onClick={() => startIssuance(p)}
                >
                    {p.ipInfo.ipDescription.name}
                </Button>
            ))}
        </div>
    );
}

export default function IdentityIssuanceStartGuard() {
    const { t } = useTranslation('identityIssuance');
    const [pendingIdentity, setPendingidentity] = useAtom(pendingIdentityAtom);
    const [blocked, setBlocked] = useState(false);

    useEffect(() => {
        if (pendingIdentity) {
            setBlocked(true);
        }
    }, []);

    if (blocked) {
        return (
            <div className="identity-issuance__start">
                <p className="identity-issuance__text">{t('alreadyPending')}</p>
                <Button
                    onClick={() => {
                        setPendingidentity(undefined);
                        setBlocked(false);
                    }}
                >
                    Reset
                </Button>
            </div>
        );
    }
    return <IdentityIssuanceStart />;
}
