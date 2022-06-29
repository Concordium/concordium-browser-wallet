import { useAtom, useAtomValue } from 'jotai';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, Route, Routes } from 'react-router-dom';

import { accountsAtom, selectedAccountAtom } from '@popup/store/account';
import Button from '@popup/shared/Button';
import { credentialsAtom, urlWhitelistAtom } from '@popup/store/settings';
import CloseButton from '@popup/shared/CloseButton';
import { accountRoutes } from './routes';
import AccountActions from './AccountActions';

function Account() {
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
        <div className="flex-column justify-space-between align-center h-full">
            <div className="flex-column align-center">
                {accounts.length === 0 && <div>{t('noAccounts')}</div>}
                {selectedAccount !== undefined && (
                    <>
                        <div className="account-page__address">{t('address', { address: selectedAccount })}</div>
                        <Button danger className="m-t-20" onClick={removeAccount}>
                            {t('removeAccount')}
                        </Button>
                    </>
                )}
                <Button disabled={!whitelist.length} danger className="m-t-20" onClick={removeConnections}>
                    {t('resetConnections')}
                </Button>
                <div className="account-page__routes">
                    <Outlet />
                    <CloseButton />
                </div>
            </div>
            <AccountActions />
        </div>
    );
}

export default function AccountRoutes() {
    return (
        <Routes>
            <Route element={<Account />}>
                <Route index element={<div>Transaction log</div>} />
                <Route path={accountRoutes.send} element={<div>Send CCD</div>} />
                <Route path={accountRoutes.receive} element={<div>Receive CCD</div>} />
                <Route path={accountRoutes.settings} element={<div>Account settings</div>} />
            </Route>
        </Routes>
    );
}
