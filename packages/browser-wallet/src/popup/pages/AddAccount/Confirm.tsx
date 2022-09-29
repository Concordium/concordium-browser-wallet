import React, { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import IdCard from '@popup/shared/IdCard';
import { identityProvidersAtom, selectedIdentityAtom } from '@popup/store/identity';
import { credentialsAtom, creatingCredentialRequestAtom } from '@popup/store/account';
import { networkConfigurationAtom } from '@popup/store/settings';
import { CreationStatus, WalletCredential } from '@shared/storage/types';
import Button from '@popup/shared/Button';
import ArrowIcon from '@assets/svg/arrow.svg';
import IdentityProviderIcon from '@popup/shared/IdentityProviderIcon';

import { absoluteRoutes } from '@popup/constants/routes';
import { InternalMessageType } from '@concordium/browser-wallet-message-hub';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { BackgroundResponseStatus } from '@shared/utils/types';
import { isIdentityOfCredential } from '@shared/utils/identity-helpers';
import { getGlobal, getNet } from '@shared/utils/network-helpers';
import { addToastAtom } from '@popup/state';
import { getNextEmptyCredNumber } from '@popup/shared/utils/account-helpers';
import { useDecryptedSeedPhrase } from '@popup/shared/utils/seed-phrase-helpers';
import AccountDetails from '../Account/AccountDetails';

export default function Confirm() {
    const { t } = useTranslation('addAccount');
    const nav = useNavigate();
    const selectedIdentity = useAtomValue(selectedIdentityAtom);
    const credentials = useAtomValue(credentialsAtom);
    const network = useAtomValue(networkConfigurationAtom);
    const providers = useAtomValue(identityProvidersAtom);
    const addToast = useSetAtom(addToastAtom);
    const seedPhrase = useDecryptedSeedPhrase((e) => addToast(e.message));
    const [creatingCredentialRequest, setCreatingRequest] = useAtom(creatingCredentialRequestAtom);

    const identityProvider = useMemo(
        () => providers.find((p) => p.ipInfo.ipIdentity === selectedIdentity?.providerIndex),
        [selectedIdentity?.providerIndex]
    );

    const submit = useCallback(async () => {
        setCreatingRequest(true);
        try {
            if (!seedPhrase) {
                return;
            }
            if (!network) {
                throw new Error('Network is not specified');
            }
            if (!identityProvider) {
                throw new Error('provider not found');
            }
            if (!selectedIdentity || selectedIdentity.status !== CreationStatus.Confirmed) {
                throw new Error('Selected identity is not defined or not confirmed');
            }

            const global = await getGlobal(network);

            // Make request
            const expiry = Math.floor(Date.now() / 1000) + 720;

            const credsOfCurrentIdentity = credentials.filter(isIdentityOfCredential(selectedIdentity));
            const credNumber = getNextEmptyCredNumber(credsOfCurrentIdentity);

            const response = await popupMessageHandler.sendInternalMessage(
                InternalMessageType.SendCredentialDeployment,
                {
                    globalContext: global,
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
                nav(absoluteRoutes.home.account.path);
            } else {
                addToast(response.error);
            }
        } catch (e) {
            addToast((e as Error).toString());
        } finally {
            setCreatingRequest(false);
        }
    }, [seedPhrase, network, identityProvider, selectedIdentity]);

    if (!selectedIdentity) {
        return null;
    }

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
                    disabled={creatingCredentialRequest.loading || creatingCredentialRequest.value}
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
