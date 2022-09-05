import React, { useEffect, useState } from 'react';
import PageHeader from '@popup/shared/PageHeader';
import { useNavigate } from 'react-router-dom';
import { useAtom, useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { networkConfigurationAtom, seedPhraseAtom } from '@popup/store/settings';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { InternalMessageType } from '@concordium/browser-wallet-message-hub';
import { JsonRpcClient, HttpProvider } from '@concordium/web-sdk';
import { identitiesAtom, identityProvidersAtom } from '@popup/store/identity';
import PendingArrows from '@assets/svg/pending-arrows.svg';
import Button from '@popup/shared/Button';
import { absoluteRoutes } from '@popup/constants/routes';
import { BackgroundResponseStatus } from '@shared/utils/types';
import { getIdentityProviders } from '@popup/shared/utils/wallet-proxy';
import { getNet } from '@shared/utils/network-helpers';

// TODO: improve "error state"

function DisplayRecoveryResult() {
    const { t } = useTranslation('setup');
    const navigate = useNavigate();
    const identities = useAtomValue(identitiesAtom);

    return (
        <>
            <div className="onboarding-setup__page-with-header__description">
                {t(identities.length ? 'performRecovery.description.after' : 'performRecovery.description.noneFound')}
            </div>
            <div className="onboarding-setup__recovery__results">
                {identities.map((identity) => (
                    <div className="onboarding-setup__recovery__identity">
                        <p>{identity.name}</p>
                    </div>
                ))}
            </div>
            <Button
                width="narrow"
                className="onboarding-setup__recovery__button"
                onClick={() => navigate(absoluteRoutes.home.account.path)}
            >
                {t('continue')}
            </Button>
        </>
    );
}

export default function PerformRecovery() {
    const { t } = useTranslation('setup');
    const network = useAtomValue(networkConfigurationAtom);
    const seedPhrase = useAtomValue(seedPhraseAtom);
    const [providers, setProviders] = useAtom(identityProvidersAtom);
    const [result, setResult] = useState<BackgroundResponseStatus>();

    useEffect(() => {
        getIdentityProviders()
            .then(setProviders)
            .catch(() => setResult(BackgroundResponseStatus.Error));
    }, []);

    useEffect(() => {
        if (!providers.length) {
            return;
        }
        if (!seedPhrase) {
            throw new Error('no seed phrase');
        }

        // TODO: Maybe we should not create the client for each page
        const client = new JsonRpcClient(new HttpProvider(network.jsonRpcUrl));
        client.getCryptographicParameters().then((global) => {
            if (!global) {
                throw new Error('no global fetched');
            }
            popupMessageHandler
                .sendInternalMessage(InternalMessageType.Recovery, {
                    providers,
                    globalContext: global.value,
                    seedAsHex: seedPhrase,
                    net: getNet(network),
                })
                .then(setResult);
        });
    }, [providers.length]);

    return (
        <>
            <PageHeader>{t('performRecovery.title')}</PageHeader>
            <div className="onboarding-setup__page-with-header flex-column align-center">
                {!result && (
                    <>
                        <div className="onboarding-setup__page-with-header__description">
                            {t('performRecovery.description.during')}
                        </div>
                        <PendingArrows className="identity-issuance__start__loading-arrows" />
                    </>
                )}
                {result === BackgroundResponseStatus.Success && <DisplayRecoveryResult />}
                {result === BackgroundResponseStatus.Error && <p>Error!</p>}
            </div>
        </>
    );
}
