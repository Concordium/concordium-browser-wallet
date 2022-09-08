import React, { useEffect, useState } from 'react';
import PageHeader from '@popup/shared/PageHeader';
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
import { BackgroundResponseStatus, RecoveryBackgroundResponse } from '@shared/utils/types';
import { getIdentityProviders } from '@popup/shared/utils/wallet-proxy';
import { displayAsCcd } from 'wallet-common-helpers';
import { displaySplitAddress } from '@popup/shared/utils/account-helpers';
import { getNet } from '@shared/utils/network-helpers';
import { IdentityProvider, NetworkConfiguration } from '@shared/storage/types';

// TODO: improve "error state"

function DisplayRecoveryResult() {
    const { t } = useTranslation('setup');
    const navigate = useNavigate();
    const identities = useAtomValue(identitiesAtom);
    const credentials = useAtomValue(credentialsAtom);
    const setSelectedAccount = useSetAtom(selectedAccountAtom);

    useEffect(() => {
        if (credentials.length) {
            setSelectedAccount(credentials[0].address);
        }
    });

    return (
        <>
            <div className="onboarding-setup__page-with-header__description">
                {t(identities.length ? 'performRecovery.description.after' : 'performRecovery.description.noneFound')}
            </div>
            <div className="onboarding-setup__recovery__results">
                {identities.map((identity) => (
                    <div
                        key={`${identity.providerIndex}-${identity.index}`}
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
            <Button
                width="medium"
                className="onboarding-setup__recovery__button"
                onClick={() => navigate(absoluteRoutes.home.account.path)}
            >
                {t('continue')}
            </Button>
        </>
    );
}

async function recovery(seedPhrase: string, network: NetworkConfiguration, providers: IdentityProvider[]) {
    let global;
    try {
        const client = new JsonRpcClient(new HttpProvider(network.jsonRpcUrl));
        global = await client.getCryptographicParameters();
    } catch {
        return { status: BackgroundResponseStatus.Error, reason: 'Unable fetch global parameters' };
    }
    if (!global) {
        throw new Error('no global fetched');
    }
    return popupMessageHandler.sendInternalMessage(InternalMessageType.Recovery, {
        providers,
        globalContext: global.value,
        seedAsHex: seedPhrase,
        net: getNet(network),
    });
}

export default function PerformRecovery() {
    const { t } = useTranslation('setup');
    const network = useAtomValue(networkConfigurationAtom);
    const seedPhrase = useAtomValue(seedPhraseAtom);
    const [providers, setProviders] = useAtom(identityProvidersAtom);
    const [result, setResult] = useState<RecoveryBackgroundResponse>();
    const [runRecovery, setRunRecovery] = useState<boolean>(true);

    useEffect(() => {
        if (!runRecovery) {
            return;
        }

        setRunRecovery(false);

        if (!seedPhrase) {
            setResult({ status: BackgroundResponseStatus.Error, reason: 'No seed phrase found' });
        }

        if (!providers.length) {
            getIdentityProviders()
                .then((identitityProviders) => {
                    setProviders(identitityProviders);
                    recovery(seedPhrase, network, identitityProviders).then(setResult);
                })
                .catch(() =>
                    setResult({
                        status: BackgroundResponseStatus.Error,
                        reason: 'Unable to get list of identity providers',
                    })
                );
        } else {
            recovery(seedPhrase, network, providers).then(setResult);
        }
    }, [runRecovery]);

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
                {result?.status === BackgroundResponseStatus.Success && <DisplayRecoveryResult />}
                {result?.status === BackgroundResponseStatus.Error && (
                    <>
                        <p>{t('performRecovery.description.error')}</p>
                        <p>{result?.reason}</p>
                        <Button
                            width="medium"
                            className="onboarding-setup__recovery__button"
                            onClick={() => {
                                setResult(undefined);
                                setRunRecovery(true);
                            }}
                        >
                            {t('retry')}
                        </Button>
                    </>
                )}
            </div>
        </>
    );
}
