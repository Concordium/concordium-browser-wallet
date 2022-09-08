import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import IdCard from '@popup/shared/IdCard';
import { identityProvidersAtom, selectedIdentityAtom } from '@popup/store/identity';
import { credentialsAtom, selectedAccountAtom } from '@popup/store/account';
import { networkConfigurationAtom, seedPhraseAtom } from '@popup/store/settings';
import { CreationStatus, WalletCredential } from '@shared/storage/types';
import { JsonRpcClient, HttpProvider } from '@concordium/web-sdk';
import Button from '@popup/shared/Button';
import ArrowIcon from '@assets/svg/arrow.svg';
import IdentityProviderIcon from '@popup/shared/IdentityProviderIcon';

import { absoluteRoutes } from '@popup/constants/routes';
import { InternalMessageType } from '@concordium/browser-wallet-message-hub';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { BackgroundResponseStatus } from '@shared/utils/types';
import { getNet } from '@shared/utils/network-helpers';
import { addToastAtom, creatingCredentialRequestAtom } from '@popup/state';
import AccountDetails from '../Account/AccountDetails';

export default function Confirm() {
    const { t } = useTranslation('addAccount');
    const nav = useNavigate();
    const selectedIdentity = useAtomValue(selectedIdentityAtom);
    const credentials = useAtomValue(credentialsAtom);
    const setSelectedAccount = useSetAtom(selectedAccountAtom);
    const seedPhrase = useAtomValue(seedPhraseAtom);
    const network = useAtomValue(networkConfigurationAtom);
    const providers = useAtomValue(identityProvidersAtom);
    const addToast = useSetAtom(addToastAtom);
    const [creatingCredentialRequest, setCreatingRequest] = useAtom(creatingCredentialRequestAtom);

    const identityProvider = useMemo(
        () => providers.find((p) => p.ipInfo.ipIdentity === selectedIdentity?.providerIndex),
        [selectedIdentity?.providerIndex]
    );

    if (!selectedIdentity || selectedIdentity.status !== CreationStatus.Confirmed) {
        throw new Error('No selected Identity or selected is not confirmed');
    }

    const submit = async () => {
        setCreatingRequest(true);
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

            if (!identityProvider) {
                throw new Error('provider not found');
            }

            // Make request
            const expiry = Math.floor(Date.now() / 1000) + 720;

            const credsOfCurrentIdentity = credentials.filter((cred) => cred.identityIndex === selectedIdentity.index);
            const credNumber = credsOfCurrentIdentity.length
                ? credsOfCurrentIdentity.reduce((best, cred) => Math.max(best, cred.credNumber), 0) + 1
                : 0;

            const response = await popupMessageHandler.sendInternalMessage(
                InternalMessageType.SendCredentialDeployment,
                {
                    globalContext: global.value,
                    ipInfo: identityProvider.ipInfo,
                    arsInfos: identityProvider.arsInfos,
                    seedAsHex: seedPhrase,
                    net: getNet(network),
                    idObject: selectedIdentity.idObject.value,
                    revealedAttributes: [],
                    identityIndex: selectedIdentity.index,
                    credNumber,
                    expiry,
                }
            );

            if (response.status === BackgroundResponseStatus.Success) {
                setSelectedAccount(response.address);
                nav(absoluteRoutes.home.account.path);
            } else {
                addToast(response.error);
            }
        } catch (e) {
            addToast((e as Error).toString());
        } finally {
            setCreatingRequest(false);
        }
    };

    // TODO: Better faking of AccountDetails
    return (
        <div className="flex-column align-center">
            <div className="w-full relative">
                <AccountDetails
                    className="add-account-page__blur-details"
                    expanded
                    account={
                        {
                            address: 'Pending',
                            status: CreationStatus.Pending,
                            identityIndex: selectedIdentity.index,
                        } as WalletCredential
                    }
                />
                <Button
                    className="add-account-page__confirm-button"
                    type="submit"
                    width="wide"
                    onClick={submit}
                    disabled={creatingCredentialRequest}
                >
                    {t('createAccount')}
                </Button>
                <ArrowIcon className="add-account-page__arrow" />
            </div>
            <IdCard
                name={selectedIdentity.name}
                provider={<IdentityProviderIcon provider={identityProvider} />}
                status={selectedIdentity.status}
                className="m-t-40"
            />
        </div>
    );
}
