import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom, useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { networkConfigurationAtom, seedPhraseAtom } from '@popup/store/settings';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { InternalMessageType } from '@concordium/browser-wallet-message-hub';
import { JsonRpcClient, HttpProvider, CryptographicParameters } from '@concordium/web-sdk';
import { identityProvidersAtom, isRecoveringAtom } from '@popup/store/identity';
import PendingArrows from '@assets/svg/pending-arrows.svg';
import { BackgroundResponseStatus } from '@shared/utils/types';
import { getIdentityProviders } from '@popup/shared/utils/wallet-proxy';
import { getNet } from '@shared/utils/network-helpers';
import { NetworkConfiguration } from '@shared/storage/types';
import PageHeader from '@popup/shared/PageHeader';
import { absoluteRoutes } from '@popup/constants/routes';

async function getGlobal(network: NetworkConfiguration): Promise<CryptographicParameters> {
    const client = new JsonRpcClient(new HttpProvider(network.jsonRpcUrl));
    const global = await client.getCryptographicParameters();
    if (!global) {
        throw new Error('no global fetched');
    }
    return global.value;
}

export default function RecoveryMain() {
    const { t } = useTranslation('recovery');
    const network = useAtomValue(networkConfigurationAtom);
    const seedPhrase = useAtomValue(seedPhraseAtom);
    const [providers, setProviders] = useAtom(identityProvidersAtom);
    const [isRecovering, setIsRecovering] = useAtom(isRecoveringAtom);
    const [runRecovery, setRunRecovery] = useState<boolean>(true);
    const navigate = useNavigate();

    const onError = useCallback(
        (reason: string) =>
            navigate(absoluteRoutes.prompt.recovery.path, {
                state: { status: BackgroundResponseStatus.Error, reason },
            }),
        []
    );

    useEffect(() => {
        if (runRecovery && !providers.length) {
            getIdentityProviders()
                .then(setProviders)
                .catch(() => onError('Unable to get list of identity providers'));
        }
    });

    useEffect(() => {
        if (!runRecovery || isRecovering.loading || !providers.length) {
            return;
        }

        setRunRecovery(false);

        if (isRecovering.value) {
            return;
        }

        if (!seedPhrase) {
            onError('Unable to get list of identity providers');
        }

        getGlobal(network)
            .then((global) => {
                setIsRecovering(true);
                popupMessageHandler.sendInternalMessage(InternalMessageType.Recovery, {
                    providers,
                    globalContext: global,
                    seedAsHex: seedPhrase,
                    net: getNet(network),
                });
            })
            .catch((error) => onError(error.message));
    }, [runRecovery, isRecovering.loading, isRecovering.value, providers.length]);

    return (
        <>
            <PageHeader>{t('main.title')}</PageHeader>
            <div className="recovery__main onboarding-setup__page-with-header">
                <div className="onboarding-setup__page-with-header__description">{t('main.description')}</div>
                <PendingArrows className="identity-issuance__start__loading-arrows" />
            </div>
        </>
    );
}
