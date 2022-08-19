import PageHeader from '@popup/shared/PageHeader';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { networkConfigurationAtom, seedPhraseAtom } from '@popup/store/settings';
import { credentialsAtom, selectedAccountAtom } from '@popup/store/account';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { InternalMessageType } from '@concordium/browser-wallet-message-hub';
import { JsonRpcClient, HttpProvider } from '@concordium/web-sdk';
import { identitiesAtom, identityProvidersAtom } from '@popup/store/identity';
import PendingArrows from '@assets/svg/pending-arrows.svg';
import Button from '@popup/shared/Button';
import { absoluteRoutes } from '@popup/constants/routes';
import { BackgroundResponseStatus } from '@shared/utils/types';
import { getIdentityProviders } from '@popup/shared/utils/wallet-proxy';
import { displayAsCcd } from 'wallet-common-helpers';
import { displaySplitAddress } from '@popup/shared/utils/account-helpers';

// TODO: improve "error state"
// TODO: Special handling for no identities found

function DisplayRecoveryResult() {
    const { t } = useTranslation('setup');
    const navigate = useNavigate();
    const identities = useAtomValue(identitiesAtom);
    const credentials = useAtomValue(credentialsAtom);

    return (
        <>
            <div className="onboarding-setup__page-with-header__description">
                {t('performRecovery.description.after')}
            </div>
            <div className="onboarding-setup__recovery__results">
                {identities.map((identity) => (
                    <div
                        key={`${identity.index}-${identity.provider}`}
                        className="onboarding-setup__recovery__identity"
                    >
                        <p>{identity.name}</p>
                        {credentials
                            .filter((cred) => cred.identityIndex === identity.index)
                            .map((cred) => (
                                <div className="onboarding-setup__recovery__credential" key={cred.credId}>
                                    <p>{displaySplitAddress(cred.address)}</p>
                                    <p>{displayAsCcd(0n)}</p>
                                </div>
                            ))}
                    </div>
                ))}
            </div>
            <Button className="m-t-20" width="wide" onClick={() => navigate(absoluteRoutes.home.account.path)}>
                {t('continue')}
            </Button>
        </>
    );
}

export default function EnterRecoveryPhrase() {
    const { t } = useTranslation('setup');
    const { jsonRpcUrl } = useAtomValue(networkConfigurationAtom);
    const masterSeed = useAtomValue(seedPhraseAtom);
    const credentials = useAtomValue(credentialsAtom);
    const setSelectedAccount = useSetAtom(selectedAccountAtom);
    const [providers, setProviders] = useAtom(identityProvidersAtom);
    const [result, setResult] = useState<BackgroundResponseStatus>();

    useEffect(() => {
        getIdentityProviders().then(setProviders);
    }, []);

    useEffect(() => {
        if (!providers.length) {
            return;
        }

        if (!jsonRpcUrl) {
            throw new Error('no json rpc url');
        }
        if (!masterSeed) {
            throw new Error('no master seed');
        }

        // TODO: Maybe we should not create the client for each page
        const client = new JsonRpcClient(new HttpProvider(jsonRpcUrl));
        client.getCryptographicParameters().then((global) => {
            if (!global) {
                throw new Error('no global fetched');
            }

            // TODO Get this from settings, when we store the chosen net
            const net = 'Testnet';

            popupMessageHandler
                .sendInternalMessage(InternalMessageType.Recovery, {
                    providers,
                    globalContext: global.value,
                    seedAsHex: masterSeed,
                    net,
                })
                .then((response) => {
                    setSelectedAccount(credentials[0].address);
                    setResult(response);
                });
        });
    }, [providers.length]);

    return (
        <>
            <PageHeader>{t('performRecovery.title')}</PageHeader>
            <div className="onboarding-setup__page-with-header onboarding-setup__recovery">
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
