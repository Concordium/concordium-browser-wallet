/* eslint-disable no-console */
/* eslint-disable no-nested-ternary */
import React, { useState, useCallback, useEffect } from 'react';
import Page from '@popup/popupX/shared/Page';
import Button from '@popup/popupX/shared/Button';
import { useTranslation } from 'react-i18next';
import Text from '@popup/popupX/shared/Text';
import { useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import {
    connectLedgerDevice,
    discoverLedgerAccounts,
    isLedgerConnected,
    verifyLedgerAppOpen,
    getLedgerAccountInfo,
} from '@popup/shared/ledger-helpers';
import { LedgerAccountMetadata, AccountType, CreationStatus, ConfirmedCredential } from '@shared/storage/types';
import { useSetAtom, useAtomValue } from 'jotai';
import { addToastAtom } from '@popup/state';
import { networkConfigurationAtom } from '@popup/store/settings';
import { credentialsAtom, writableCredentialAtom } from '@popup/store/account';
import Checkmark from '@assets/svgX/checkmark.svg';

export default function AddLedgerAccount() {
    const { t } = useTranslation('x', { keyPrefix: 'addLedgerAccount' });
    const nav = useNavigate();
    const addToast = useSetAtom(addToastAtom);
    const network = useAtomValue(networkConfigurationAtom);
    const existingCredentials = useAtomValue(credentialsAtom);
    const setCredentials = useSetAtom(writableCredentialAtom);
    const [loading, setLoading] = useState(false);
    const [importing, setImporting] = useState(false);
    const [connecting, setConnecting] = useState(false);
    const [accounts, setAccounts] = useState<LedgerAccountMetadata[]>([]);
    const [selectedAccounts, setSelectedAccounts] = useState<Set<string>>(new Set());
    const [isDeviceConnected, setIsDeviceConnected] = useState(false);

    useEffect(() => {
        // Check if Ledger is already connected
        isLedgerConnected().then(setIsDeviceConnected);
    }, []);

    const handleConnect = useCallback(async () => {
        setConnecting(true);
        try {
            const { concordiumApp } = await connectLedgerDevice();

            // Verify Concordium app is open
            const isAppOpen = await verifyLedgerAppOpen(concordiumApp);
            if (!isAppOpen) {
                addToast(t('openConcordiumApp'));
                return;
            }

            setIsDeviceConnected(true);
            addToast(t('deviceConnected'));
        } catch (error) {
            addToast((error as Error).message);
        } finally {
            setConnecting(false);
        }
    }, [addToast, t]);

    const handleDiscoverAccounts = useCallback(
        async (identityProvider: number, identityIndex: number) => {
            setLoading(true);
            try {
                const { concordiumApp } = await connectLedgerDevice();
                const discoveredAccounts = await discoverLedgerAccounts(
                    concordiumApp,
                    identityProvider,
                    identityIndex,
                    0,
                    5
                );
                setAccounts(discoveredAccounts);
            } catch (error) {
                addToast((error as Error).message);
            } finally {
                setLoading(false);
            }
        },
        [addToast]
    );

    const handleSelectAccount = useCallback((account: LedgerAccountMetadata) => {
        setSelectedAccounts((prev) => {
            const newSet = new Set(prev);
            if (newSet.has(account.derivationPath)) {
                newSet.delete(account.derivationPath);
            } else {
                newSet.add(account.derivationPath);
            }
            return newSet;
        });
    }, []);

    const handleImport = useCallback(async () => {
        if (selectedAccounts.size === 0 || !network) return;

        setImporting(true);
        try {
            const { concordiumApp } = await connectLedgerDevice();

            // Filter selected accounts
            const accountsToImport = accounts.filter((acc) => selectedAccounts.has(acc.derivationPath));

            // Get full account info for each selected account
            const newCredentials: ConfirmedCredential[] = [];

            for (const account of accountsToImport) {
                try {
                    // Get the public key from Ledger device
                    const accountInfo = await getLedgerAccountInfo(concordiumApp, account.derivationPath);

                    // Generate a unique identifier for this Ledger account using public key hash
                    // This is a placeholder until the account is actually deployed
                    const credId = accountInfo.publicKey.slice(0, 96); // Use first 96 chars of public key as credId
                    const tempAddress = `LEDGER_${accountInfo.publicKey.slice(0, 48)}`; // Temporary address

                    // Check if this account (by public key/path) already exists
                    const exists = existingCredentials.some(
                        (cred) => cred.ledgerPath === account.derivationPath || cred.address === tempAddress
                    );
                    if (exists) {
                        addToast(t('accountAlreadyExists', { address: account.derivationPath }));
                        // eslint-disable-next-line no-continue
                        continue;
                    }

                    // Create the credential object
                    // Note: This creates an undeployed credential - user will need to deploy it later
                    const credential: ConfirmedCredential = {
                        address: tempAddress,
                        credId,
                        credNumber: account.credentialIndex,
                        credName: `Ledger Account ${account.credentialIndex}`,
                        status: CreationStatus.Confirmed,
                        identityIndex: account.identityIndex,
                        providerIndex: account.identityProvider,
                        accountType: AccountType.LedgerBased,
                        ledgerPath: account.derivationPath,
                    };

                    newCredentials.push(credential);
                } catch (error) {
                    addToast(t('errorImportingAccount', { path: account.derivationPath }));
                    console.error('Error importing account:', error);
                }
            }

            if (newCredentials.length > 0) {
                // Update credentials directly via atom
                const updatedCredentials = [...existingCredentials, ...newCredentials];
                await setCredentials(updatedCredentials);

                addToast(t('accountsImported', { count: newCredentials.length }));

                // Navigate back to accounts page
                nav(absoluteRoutes.settings.accounts.path);
            } else {
                addToast(t('noAccountsImported'));
            }
        } catch (error) {
            addToast((error as Error).message);
        } finally {
            setImporting(false);
        }
    }, [selectedAccounts, accounts, network, existingCredentials, setCredentials, addToast, t, nav]);

    return (
        <Page className="add-ledger-account-x">
            <Page.Top heading={t('title')} />
            <Page.Main>
                <Text.Capture>{t('description')}</Text.Capture>

                {!isDeviceConnected ? (
                    <>
                        <Text.MainMedium className="m-t-20">{t('connectDevice')}</Text.MainMedium>
                        <Button.Main
                            label={t('connectLedger')}
                            onClick={handleConnect}
                            disabled={connecting}
                            className="m-t-10"
                        />
                    </>
                ) : accounts.length === 0 ? (
                    <>
                        <Text.MainMedium className="m-t-20">{t('deviceConnected')}</Text.MainMedium>
                        <Text.Capture className="m-t-10">{t('selectIdentityPrompt')}</Text.Capture>
                        {/* In a full implementation, show identity selection here */}
                        <Button.Main
                            label={t('discoverAccounts')}
                            onClick={() => handleDiscoverAccounts(0, 0)}
                            disabled={loading}
                            className="m-t-10"
                        />
                    </>
                ) : (
                    <>
                        <Text.MainMedium className="m-t-20">{t('selectAccount')}</Text.MainMedium>
                        <Text.Capture className="m-t-10">{t('selectMultipleHint')}</Text.Capture>
                        <div className="ledger-accounts-list m-t-20">
                            {accounts.map((account, index) => {
                                const isSelected = selectedAccounts.has(account.derivationPath);
                                return (
                                    <div
                                        key={account.derivationPath}
                                        role="button"
                                        tabIndex={0}
                                        onClick={() => handleSelectAccount(account)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                e.preventDefault();
                                                handleSelectAccount(account);
                                            }
                                        }}
                                        style={{
                                            cursor: 'pointer',
                                            border: isSelected ? '2px solid #4CAF50' : '1px solid #ddd',
                                            backgroundColor: isSelected ? '#f0f8f0' : 'transparent',
                                            borderRadius: '8px',
                                            padding: '16px',
                                            marginBottom: '12px',
                                        }}
                                    >
                                        <div
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '12px',
                                                marginBottom: '8px',
                                            }}
                                        >
                                            <div
                                                style={{
                                                    width: '20px',
                                                    height: '20px',
                                                    border: isSelected ? '2px solid #4CAF50' : '2px solid #ddd',
                                                    borderRadius: '4px',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    backgroundColor: isSelected ? '#4CAF50' : 'transparent',
                                                    flexShrink: 0,
                                                }}
                                            >
                                                {isSelected && (
                                                    <Checkmark
                                                        style={{ width: '14px', height: '14px', fill: 'white' }}
                                                    />
                                                )}
                                            </div>
                                            <Text.Main>{t('accountNumber', { number: index + 1 })}</Text.Main>
                                        </div>
                                        <div style={{ marginLeft: '32px' }}>
                                            <Text.Capture className="mono">
                                                {account.publicKey.slice(0, 16)}...
                                            </Text.Capture>
                                        </div>
                                        <div style={{ marginLeft: '32px', marginTop: '4px' }}>
                                            <Text.Capture className="text-secondary">
                                                {account.derivationPath}
                                            </Text.Capture>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <Button.Main
                            label={t('importSelected', { count: selectedAccounts.size })}
                            onClick={handleImport}
                            disabled={selectedAccounts.size === 0 || importing}
                            className="m-t-20"
                        />
                    </>
                )}
            </Page.Main>
        </Page>
    );
}
