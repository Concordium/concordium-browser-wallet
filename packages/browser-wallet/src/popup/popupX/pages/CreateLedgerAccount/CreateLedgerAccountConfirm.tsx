/* eslint-disable no-console */
import React, { useCallback, useState, useEffect } from 'react';
import Page from '@popup/popupX/shared/Page';
import { useTranslation } from 'react-i18next';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import Button from '@popup/popupX/shared/Button';
import { identitiesAtom } from '@popup/store/identity';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { ConfirmedIdCard } from '@popup/popupX/shared/IdCard';
import { CreationStatus, AccountType, ConfirmedCredential } from '@shared/storage/types';
import FatArrowUp from '@assets/svgX/fat-arrow-up.svg';
import { networkConfigurationAtom } from '@popup/store/settings';
import { addToastAtom } from '@popup/state';
import { creatingCredentialRequestAtom, credentialsAtom, writableCredentialAtom } from '@popup/store/account';
import { isIdentityOfCredential } from '@shared/utils/identity-helpers';
import { getNextEmptyCredNumber } from '@popup/shared/utils/account-helpers';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import {
    connectLedgerDevice,
    verifyLedgerAppOpen,
    getLedgerAccountInfo,
    buildLedgerPath,
} from '@popup/shared/ledger-helpers';

type CreateLedgerAccountConfirmProps = {
    identityProviderIndex: number;
    identityIndex: number;
};

function ConfirmInfo({ identityProviderIndex, identityIndex }: CreateLedgerAccountConfirmProps) {
    const { t } = useTranslation('x', { keyPrefix: 'createLedgerAccount' });
    const identities = useAtomValue(identitiesAtom);
    const identity = identities.find((id) => id.providerIndex === identityProviderIndex && id.index === identityIndex);
    const [creatingCredentialRequest, setCreatingRequest] = useAtom(creatingCredentialRequestAtom);
    const credentials = useAtomValue(credentialsAtom);
    const setCredentials = useSetAtom(writableCredentialAtom);
    const addToast = useSetAtom(addToastAtom);
    const network = useAtomValue(networkConfigurationAtom);
    const nav = useNavigate();
    const [connecting, setConnecting] = useState(false);

    // Reset the creating credential state on mount
    useEffect(() => {
        console.log('CreateLedgerAccountConfirm mounted, creatingCredentialRequest:', creatingCredentialRequest);
        if (creatingCredentialRequest.value) {
            console.log('Resetting stuck creatingCredentialRequest state');
            setCreatingRequest(false);
        }
    }, []);

    console.log('Button disabled?', creatingCredentialRequest.value, 'connecting?', connecting);

    const onCreateAccount = useCallback(async () => {
        if (identity === undefined || identity.status !== CreationStatus.Confirmed || !network) {
            throw new Error(`Invalid identity or network: ${identity}`);
        }
        setCreatingRequest(true);
        setConnecting(true);

        try {
            // Connect to Ledger device
            const { concordiumApp } = await connectLedgerDevice();

            // Verify Concordium app is open
            const isAppOpen = await verifyLedgerAppOpen(concordiumApp);
            if (!isAppOpen) {
                addToast(t('openConcordiumApp'));
                return;
            }

            // Get the next credential number for this identity
            const credsOfCurrentIdentity = credentials.filter(isIdentityOfCredential(identity));
            const credNumber = getNextEmptyCredNumber(credsOfCurrentIdentity);

            // Build the derivation path for this credential
            const derivationPath = buildLedgerPath(
                identity.providerIndex,
                identity.index,
                credNumber,
                0 // key index
            );

            // Get the public key from Ledger
            const accountInfo = await getLedgerAccountInfo(concordiumApp, derivationPath);

            // Create credential with temporary address
            const credId = accountInfo.publicKey.slice(0, 96);
            const tempAddress = `LEDGER_${accountInfo.publicKey.slice(0, 48)}`;

            // Check if this path already exists
            const exists = credentials.some((cred) => cred.ledgerPath === derivationPath);
            if (exists) {
                addToast(t('accountAlreadyExists'));
                return;
            }

            const newCredential: ConfirmedCredential = {
                address: tempAddress,
                credId,
                credNumber,
                credName: '',
                status: CreationStatus.Confirmed,
                identityIndex: identity.index,
                providerIndex: identity.providerIndex,
                accountType: AccountType.LedgerBased,
                ledgerPath: derivationPath,
            };

            // Add the credential
            const updatedCredentials = [...credentials, newCredential];
            await setCredentials(updatedCredentials);

            addToast(t('accountCreated'));
            nav(absoluteRoutes.home.path);
        } catch (error) {
            addToast((error as Error).message || t('errorCreatingAccount'));
            console.error('Error creating Ledger account:', error);
        } finally {
            setCreatingRequest(false);
            setConnecting(false);
        }
    }, [identity, network, credentials, setCredentials, addToast, t, nav, setCreatingRequest]);

    if (!identity || identity.status !== CreationStatus.Confirmed) {
        return <Navigate to={absoluteRoutes.settings.accounts.createLedger.path} />;
    }

    return (
        <Page className="create-ledger-account-confirm-x">
            <Page.Top heading={t('confirmTitle')} />
            <Page.Main>
                <div className="id-card-container m-b-40">
                    <ConfirmedIdCard identity={identity} shownAttributes={['idDocType', 'idDocNo']} hideAccounts />
                </div>
                <div className="transaction-icon flex justify-center">
                    <FatArrowUp className="width-48 m-b-40" />
                </div>
                <p className="m-b-20">{t('confirmDescription')}</p>
                <p className="m-b-20">{t('ledgerNote')}</p>
            </Page.Main>
            <Page.Footer>
                <Button.Main
                    label={connecting ? t('connecting') : t('confirmButton')}
                    onClick={onCreateAccount}
                    disabled={creatingCredentialRequest.value}
                />
            </Page.Footer>
        </Page>
    );
}

export default function CreateLedgerAccountConfirm() {
    const { identityProviderIndex, identityIndex } = useParams();
    const providerIndex = identityProviderIndex ? parseInt(identityProviderIndex, 10) : undefined;
    const idIndex = identityIndex ? parseInt(identityIndex, 10) : undefined;
    if (providerIndex === undefined || idIndex === undefined) {
        return <Navigate to={absoluteRoutes.settings.accounts.createLedger.path} />;
    }
    return <ConfirmInfo identityProviderIndex={providerIndex} identityIndex={idIndex} />;
}
