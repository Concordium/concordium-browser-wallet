import React, { useCallback } from 'react';
import Page from '@popup/popupX/shared/Page';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Button from '@popup/popupX/shared/Button';
import { identitiesAtom, identityProvidersAtom } from '@popup/store/identity';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { ConfirmedIdCard } from '@popup/popupX/shared/IdCard';
import { ConfirmedIdentity, CreationStatus } from '@shared/storage/types';
import FatArrowUp from '@assets/svgX/fat-arrow-up.svg';
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
import { absoluteRoutes } from '@popup/popupX/constants/routes';

/**
 * Hook providing function for sending credential deployments.
 */
export function useSendCredentialDeployment() {
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
    const { t } = useTranslation('x', { keyPrefix: 'createAccount' });
    const identities = useAtomValue(identitiesAtom);
    const identity = identities.find((id) => id.providerIndex === identityProviderIndex && id.index === identityIndex);
    const [creatingCredentialRequest, setCreatingRequest] = useAtom(creatingCredentialRequestAtom);
    const deployment = useSendCredentialDeployment();
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

    if (identity === undefined) {
        return null;
    }
    if (identity.status !== CreationStatus.Confirmed) {
        return <Navigate to="../" />;
    }
    const loading = creatingCredentialRequest.loading || creatingCredentialRequest.value || deployment.loading;
    return (
        <>
            <div className="justify-content-center">
                <FatArrowUp />
            </div>
            <ConfirmedIdCard identity={identity} shownAttributes={['idDocType', 'idDocNo']} hideAccounts />
            <Button.Main disabled={loading} type="submit" label={t('confirmButton')} onClick={onCreateAccount} />
        </>
    );
}

export default function CreateAccountConfirm() {
    const params = useParams();
    if (params.identityProviderIndex === undefined || params.identityIndex === undefined) {
        // No account address passed in the url.
        return <Navigate to="../" />;
    }
    const identityIndex = parseInt(params.identityIndex, 10);
    const identityProviderIndex = parseInt(params.identityProviderIndex, 10);
    if (Number.isNaN(identityProviderIndex) || Number.isNaN(identityIndex)) {
        return <Navigate to="../" />;
    }
    return (
        <Page className="create-account-x">
            <Page.Footer>
                <ConfirmInfo identityIndex={identityIndex} identityProviderIndex={identityProviderIndex} />
            </Page.Footer>
        </Page>
    );
}
