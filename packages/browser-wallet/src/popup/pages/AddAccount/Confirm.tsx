import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import IdCard from '@popup/shared/IdCard';
import { selectedIdentityAtom } from '@popup/store/identity';
import { selectedAccountAtom } from '@popup/store/account';
import { credentialsAtom, jsonRpcUrlAtom, seedPhraseAtom } from '@popup/store/settings';
import { IdentityStatus, IdentityProvider } from '@shared/storage/types';
import {
    JsonRpcClient,
    HttpProvider,
    createCredentialV1,
    CredentialInputV1,
    getAccountAddress,
    getSignedCredentialDeploymentTransactionHash,
} from '@concordium/web-sdk';
import { getIdentityProviders } from '@popup/shared/utils/wallet-proxy';
import Button from '@popup/shared/Button';
import ArrowIcon from '@assets/svg/arrow.svg';

import { absoluteRoutes } from '@popup/constants/routes';
import AccountDetails from '../Account/AccountDetails';

export default function AddAccount() {
    const { t } = useTranslation('addAccount');
    const nav = useNavigate();
    const selectedIdentity = useAtomValue(selectedIdentityAtom);
    const [credentials, setCredentials] = useAtom(credentialsAtom);
    const setSelectedAccount = useSetAtom(selectedAccountAtom);
    const masterSeed = useAtomValue(seedPhraseAtom);
    const jsonRrcUrl = useAtomValue(jsonRpcUrlAtom);
    const [providers, setProviders] = useState<IdentityProvider[]>([]);

    useEffect(() => {
        getIdentityProviders().then((loadedProviders) => setProviders(loadedProviders));
    }, []);

    if (!selectedIdentity || selectedIdentity.status !== IdentityStatus.Confirmed) {
        throw new Error('No selected Identity or selected is not confirmed');
    }

    const submit = async () => {
        if (!jsonRrcUrl) {
            throw new Error('no json rpc url');
        }
        if (!masterSeed) {
            throw new Error('no master seed');
        }

        // TODO: Maybe we should not create the client for each page
        const client = new JsonRpcClient(new HttpProvider(jsonRrcUrl));
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
            seedAsHex: masterSeed,
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
            status: IdentityStatus.Pending,
            deploymentHash: getSignedCredentialDeploymentTransactionHash(request),
            net: selectedIdentity.network,
        };

        // Add Pending
        setCredentials([...credentials, newCred]);
        // Send Request
        await client.sendCredentialDeployment(request);
        // Set selectedAccount
        setSelectedAccount(newCred.address);
        nav(absoluteRoutes.home.account.path);
    };

    // TODO: Better faking of AccountDetails
    return (
        <div className="flex-column align-center">
            <div className="w-full relative">
                <AccountDetails
                    className="add-account-page__blur-details"
                    expanded
                    account={{ address: 'Pending', status: IdentityStatus.Pending, identityId: selectedIdentity.id }}
                />
                <Button className="add-account-page__confirm-button" type="submit" width="wide" onClick={submit}>
                    {t('createAccount')}
                </Button>
                <ArrowIcon className="add-account-page__arrow" />
            </div>
            <IdCard
                name={selectedIdentity.name}
                provider={<p>Test</p>}
                status={selectedIdentity.status}
                onNameChange={() => {}}
                className="m-t-40"
            />
        </div>
    );
}
