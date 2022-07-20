import React, { useState, useEffect } from 'react';
import { useAtomValue, useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { jsonRpcUrlAtom, pendingIdentitiesAtom } from '@popup/store/settings';
import PageHeader from '@popup/shared/PageHeader';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { getIdentityProviders, IdentityProvider } from '@shared/utils/wallet-proxy';
import { InternalMessageType } from '@concordium/browser-wallet-message-hub';
import { createIdentityRequest, JsonRpcClient, HttpProvider } from '@concordium/web-sdk';
import { Network } from '@shared/storage/types';
import Button from '@popup/shared/Button';

const redirectUri = 'ConcordiumRedirectToken';

export default function IdentityIssuanceStart() {
    const { t } = useTranslation('identityIssuance');
    const [providers, setProviders] = useState<IdentityProvider[]>([]);
    const jsonRrcUrl = useAtomValue(jsonRpcUrlAtom);
    const [pendingIdentities, updatePendingIdentities] = useAtom(pendingIdentitiesAtom);
    // const { onClose, withClose } = useContext(fullscreenPromptContext);

    useEffect(() => {
        getIdentityProviders().then((loadedProviders) => setProviders(loadedProviders));
    }, []);

    const startIssuance = async (provider: IdentityProvider) => {
        if (!jsonRrcUrl) {
            throw new Error('no json rpc url');
        }

        // TODO: Maybe we should not create the client for each transaction sent
        const client = new JsonRpcClient(new HttpProvider(jsonRrcUrl));
        const global = await client.getCryptographicParameters();

        if (!global) {
            throw new Error('no global fetched');
        }

        const identityIndex = 5;
        const net = 'Testnet';

        const idObjectRequest = createIdentityRequest({
            globalContext: global.value,
            ipInfo: provider.ipInfo,
            arsInfos: provider.arsInfos,
            seed: 'efa5e27326f8fa0902e647b52449bf335b7b605adc387015ec903f41d95080eb71361cbc7fb78721dcd4f3926a337340aa1406df83332c44c1cdcfe100603860',
            net,
            identityIndex,
            arThreshold: 1,
        });

        const params = {
            scope: 'identity',
            response_type: 'code',
            redirect_uri: redirectUri,
            state: JSON.stringify({ idObjectRequest }),
        };
        const searchParams = new URLSearchParams(params);
        const urlString = 'http://localhost:8100/api/v1/identity';
        let url: string;
        if (Object.entries(params).length === 0) {
            url = urlString;
        } else {
            url = `${urlString}?${searchParams.toString()}`;
        }

        updatePendingIdentities(
            pendingIdentities.concat([
                {
                    // TODO Use total identity amount for this
                    name: `Identity ${pendingIdentities.length}`,
                    index: identityIndex,
                    network: Network[net],
                    provider: provider.ipInfo.ipIdentity,
                },
            ])
        );

        popupMessageHandler.sendInternalMessage(InternalMessageType.StartIdentityIssuance, { url });
    };

    return (
        <>
            <PageHeader>{t('title')}</PageHeader>
            <p>{t('startText')}</p>
            {providers.map((p) => (
                <Button onClick={() => startIssuance(p)}>{p.ipInfo.ipDescription.name}</Button>
            ))}
        </>
    );
}
