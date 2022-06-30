import { useAtom, useAtomValue } from 'jotai';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { accountsAtom, selectedAccountAtom } from '@popup/store/account';
import Button from '@popup/shared/Button';
import { credentialsAtom, urlWhitelistAtom } from '@popup/store/settings';
import TransactionList from './TransactionList';

export default function Account() {
    const { t } = useTranslation('account');
    const accounts = useAtomValue(accountsAtom);
    const [selectedAccount, setSelectedAccount] = useAtom(selectedAccountAtom);
    const [creds, setCreds] = useAtom(credentialsAtom);
    const [whitelist, setWhitelist] = useAtom(urlWhitelistAtom);

    const removeAccount = useCallback(() => {
        const next = creds.filter((c) => c.address !== selectedAccount);
        setCreds(next);

        setSelectedAccount(next[0]?.address);
    }, [creds, selectedAccount]);

    const removeConnections = useCallback(() => {
        setWhitelist([]);
    }, []);

    return (
        <>
            <div className="flex-column justify-center align-center">
                <div className="flex justify-space-between w-full">
                    {accounts.length === 0 && <div>{t('noAccounts')}</div>}
                </div>
                {selectedAccount !== undefined && (
                    <>
                        <div className="account-page__address">{t('address', { address: selectedAccount })}</div>
                        <Button danger className="m-t-20" onClick={removeAccount}>
                            {t('removeAccount')}
                        </Button>
                    </>
                )}
                <Button disabled={!whitelist.length} danger className="m-b-20 m-t-10" onClick={removeConnections}>
                    {t('resetConnections')}
                </Button>
            </div>
            {selectedAccount !== undefined && (
                <div className="account-page__transaction-list">
                    <TransactionList key={selectedAccount} accountAddress={selectedAccount} />
                </div>
            )}
        </>
    );
}
