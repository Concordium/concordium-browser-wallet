import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import IdCard from '@popup/shared/IdCard';
import { identityProvidersAtom, selectedIdentityAtom } from '@popup/store/identity';
import { selectedAccountAtom } from '@popup/store/account';
import { credentialsAtom, networkConfigurationAtom, seedPhraseAtom } from '@popup/store/settings';
import { CreationStatus, WalletCredential } from '@shared/storage/types';
import {
    JsonRpcClient,
    HttpProvider,
    createCredentialV1,
    CredentialInputV1,
    getAccountAddress,
    getSignedCredentialDeploymentTransactionHash,
} from '@concordium/web-sdk';
import Button from '@popup/shared/Button';
import ArrowIcon from '@assets/svg/arrow.svg';
import IdentityProviderIcon from '@popup/shared/IdentityProviderIcon';

import { absoluteRoutes } from '@popup/constants/routes';
import AccountDetails from '../Account/AccountDetails';

export default function Confirm() {
    const { t } = useTranslation('addAccount');
    const nav = useNavigate();
    const selectedIdentity = useAtomValue(selectedIdentityAtom);
    const [credentials, setCredentials] = useAtom(credentialsAtom);
    const setSelectedAccount = useSetAtom(selectedAccountAtom);
    const seedPhrase = useAtomValue(seedPhraseAtom);
    const { jsonRpcUrl } = useAtomValue(networkConfigurationAtom);
    const providers = useAtomValue(identityProvidersAtom);
    const [buttonDisabled, setButtonDisabled] = useState(false);

    const identityProvider = useMemo(
        () => providers.find((p) => p.ipInfo.ipIdentity === selectedIdentity?.provider),
        [selectedIdentity?.provider]
    );

    if (!selectedIdentity || selectedIdentity.status !== CreationStatus.Confirmed) {
        throw new Error('No selected Identity or selected is not confirmed');
    }

    const submit = async () => {
        setButtonDisabled(true);
        try {
            if (!jsonRpcUrl) {
                throw new Error('no json rpc url');
            }
            if (!seedPhrase) {
                throw new Error('no seed phrase');
            }

            // TODO: Maybe we should not create the client for each page
            const client = new JsonRpcClient(new HttpProvider(jsonRpcUrl));
            const global = await client.getCryptographicParameters();

            if (!global) {
                throw new Error('no global fetched');
            }

            const provider = providers.find((p) => p.ipInfo.ipIdentity === selectedIdentity.provider);

            if (!provider) {
                throw new Error('provider not found');
            }

            // Make request
            // TODO Get this from settings, when we store the chosen net
            const net = 'Testnet';
            const expiry = Math.floor(Date.now() / 1000) + 720;
            const credsOfCurrentIdentity = credentials.filter((cred) => cred.identityId === selectedIdentity.id);
            const credNumber = credsOfCurrentIdentity.length
                ? credsOfCurrentIdentity.reduce((best, cred) => Math.max(best, cred.credNumber), 0) + 1
                : 0;
            const credIn: CredentialInputV1 = {
                globalContext: global.value,
                ipInfo: provider.ipInfo,
                arsInfos: provider.arsInfos,
                seedAsHex: seedPhrase,
                net,
                idObject: selectedIdentity.idObject.value,
                revealedAttributes: [],
                identityIndex: selectedIdentity.index,
                credNumber,
                expiry,
            };
            const request = createCredentialV1(credIn);
            const { credId } = request.cdi;
            const newCred = {
                address: getAccountAddress(credId).address,
                identityId: selectedIdentity.id,
                credId,
                credNumber,
                status: CreationStatus.Pending,
                deploymentHash: getSignedCredentialDeploymentTransactionHash(request),
                net: selectedIdentity.network,
            };

            // Send Request
            await client.sendCredentialDeployment(request);
            // Add Pending
            setCredentials([...credentials, newCred]);
            // Set selectedAccount
            setSelectedAccount(newCred.address);
            nav(absoluteRoutes.home.account.path);
        } finally {
            setButtonDisabled(false);
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
                            identityId: selectedIdentity.id,
                        } as WalletCredential
                    }
                />
                <Button
                    className="add-account-page__confirm-button"
                    type="submit"
                    width="wide"
                    onClick={submit}
                    disabled={buttonDisabled}
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