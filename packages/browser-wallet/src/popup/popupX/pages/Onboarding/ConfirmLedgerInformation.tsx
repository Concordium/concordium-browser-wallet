/* eslint-disable no-console */
import React, { useCallback, useEffect, useState } from 'react';
import Button from '@popup/popupX/shared/Button';
import { useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import { useTranslation } from 'react-i18next';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import { identitiesAtom, identityProvidersAtom } from '@popup/store/identity';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { ConfirmedIdentity, CreationStatus } from '@shared/storage/types';
import { grpcClientAtom, networkConfigurationAtom } from '@popup/store/settings';
import { useDecryptedSeedPhrase } from '@popup/shared/utils/seed-phrase-helpers';
import { addToastAtom } from '@popup/state';
import { creatingCredentialRequestAtom, credentialsAtom } from '@popup/store/account';
import { getGlobal, getNet } from '@shared/utils/network-helpers';
import { isIdentityOfCredential } from '@shared/utils/identity-helpers';
import { getNextEmptyCredNumber } from '@popup/shared/utils/account-helpers';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { InternalMessageType } from '@messaging';
import { CredentialDeploymentBackgroundResponse } from '@shared/utils/types';

/**
 * Hook providing function for sending credential deployments.
 */
function useSendCredentialDeployment() {
    const providers = useAtomValue(identityProvidersAtom);
    const credentials = useAtomValue(credentialsAtom);
    const network = useAtomValue(networkConfigurationAtom);
    const addToast = useSetAtom(addToastAtom);
    const seedPhrase = useDecryptedSeedPhrase((e) => addToast(e.message));
    const client = useAtomValue(grpcClientAtom);

    const loading = !seedPhrase || !network || !providers || !credentials;
    const sendCredentialDeployment = useCallback(
        async (identity: ConfirmedIdentity) => {
            if (loading) {
                throw new Error('Still loading relevant information');
            }

            const identityProvider = providers.find((p) => p.ipInfo.ipIdentity === identity.providerIndex);
            if (!identityProvider) {
                throw new Error('provider not found');
            }
            const global = await getGlobal(client);

            // Make request
            const credsOfCurrentIdentity = credentials.filter(isIdentityOfCredential(identity));
            const credNumber = getNextEmptyCredNumber(credsOfCurrentIdentity);

            const response: CredentialDeploymentBackgroundResponse = await popupMessageHandler.sendInternalMessage(
                InternalMessageType.SendCredentialDeployment,
                {
                    globalContext: global,
                    ipInfo: identityProvider.ipInfo,
                    arsInfos: identityProvider.arsInfos,
                    seedAsHex: seedPhrase,
                    net: getNet(network),
                    idObject: identity.idObject.value,
                    revealedAttributes: [],
                    identityIndex: identity.index,
                    credNumber,
                }
            );
            return response;
        },
        [seedPhrase, network, providers, credentials, loading]
    );

    return { loading, sendCredentialDeployment };
}

type CreateAccountConfirmProps = {
    identityProviderIndex: number;
    identityIndex: number;
};

function ConfirmInfo({ identityProviderIndex, identityIndex }: CreateAccountConfirmProps) {
    const { t } = useTranslation('x', { keyPrefix: 'onboarding.confirmLedgerInformation' });
    const identities = useAtomValue(identitiesAtom);
    const identity = identities.find((id) => id.providerIndex === identityProviderIndex && id.index === identityIndex);
    const [creatingCredentialRequest, setCreatingRequest] = useAtom(creatingCredentialRequestAtom);
    const deployment = useSendCredentialDeployment();
    const [publicKey, setPublicKey] = useState('');
    const nav = useNavigate();

    const onCreateAccount = useCallback(async () => {
        if (identity === undefined || identity.status !== CreationStatus.Confirmed) {
            throw new Error(`Invalid identity: ${identity}`);
        }
        setCreatingRequest(true);
        deployment
            .sendCredentialDeployment(identity)
            .catch(() => {})
            .then(() => {
                nav(absoluteRoutes.home.path);
            })
            .finally(() => {
                setCreatingRequest(false);
            });
    }, [deployment.sendCredentialDeployment]);
    const loading = creatingCredentialRequest.loading || creatingCredentialRequest.value || deployment.loading;
    console.log('ConfirmInfo', { identity, loading });
    const rawKey = localStorage.getItem('publicKey');
    const formattedKey = rawKey?.match(/.{1,16}/g)?.join('\n') || rawKey || '';

    // FIX: Only update publicKey when formattedKey changes
    useEffect(() => {
        if (formattedKey) {
            setPublicKey(formattedKey);
        }
    }, [formattedKey]);
    return (
        <Page className="id-cards-info">
            <Page.Top heading={t('ids')} />
            <Page.Main>
                <Text.Capture>
                    {t('idDescription')}
                    <div
                        style={{
                            width: '150px',
                            overflowWrap: 'break-word',
                            wordBreak: 'break-word',
                            whiteSpace: 'pre-wrap',
                            marginTop: '10px',
                            backgroundColor: '#414141',
                            borderRadius: '8px',
                            padding: '10px',
                            color: '#ffffff',
                            lineBreak: 'anywhere',
                        }}
                    >
                        {publicKey}
                    </div>
                    <p>
                        <b>Signature threshold: 1</b>
                    </p>
                    <div>
                        <b>Authorities required (AR threshold):</b>
                        <p>1 out of 3</p>
                    </div>
                </Text.Capture>
            </Page.Main>
            <Page.Footer>
                <Button.Main type="button" label={t('continue')} onClick={onCreateAccount} />
            </Page.Footer>
        </Page>
    );
}

export default function ConfirmLedgerInformation() {
    console.log('CreateAccountConfirm');
    const identityIndex = parseInt(localStorage.getItem('index') ?? '', 10);
    const identityProviderIndex = parseInt(localStorage.getItem('providerIndex') ?? '', 10);

    return <ConfirmInfo identityProviderIndex={identityProviderIndex} identityIndex={identityIndex} />;
}
