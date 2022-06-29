import { useAtom, useAtomValue } from 'jotai';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { accountsAtom, selectedAccountAtom } from '@popup/store/account';
import Button from '@popup/shared/Button';
import { credentialsAtom, urlWhitelistAtom } from '@popup/store/settings';
import CloseButton from '@popup/shared/CloseButton';
import { absoluteRoutes } from '@popup/constants/routes';
import { accountRoutes } from './routes';
import AccountActions from './AccountActions';

function AccountSettings() {
    const { t } = useTranslation('account');
    const [creds, setCreds] = useAtom(credentialsAtom);
    const [selectedAccount, setSelectedAccount] = useAtom(selectedAccountAtom);
    const [whitelist, setWhitelist] = useAtom(urlWhitelistAtom);

    const removeAccount = useCallback(() => {
        const next = creds.filter((c) => c.address !== selectedAccount);
        setCreds(next);

        setSelectedAccount(next[0]?.address);
    }, [creds, selectedAccount]);

    const removeConnections = useCallback(() => {
        setWhitelist([]);
    }, []);

    if (selectedAccount === undefined) {
        return null;
    }

    return (
        <div className="flex-column">
            <Button danger onClick={removeAccount}>
                {t('removeAccount')}
            </Button>
            <Button disabled={!whitelist.length} danger className="m-t-20" onClick={removeConnections}>
                {t('resetConnections')}
            </Button>
        </div>
    );
}

function Account() {
    const { t } = useTranslation('account');
    const accounts = useAtomValue(accountsAtom);
    const selectedAccount = useAtomValue(selectedAccountAtom);
    const { pathname } = useLocation();
    const nav = useNavigate();

    const canClose = pathname !== absoluteRoutes.home.account.path;

    return (
        <div className="flex-column justify-space-between align-center h-full relative">
            <div className="flex-column align-center flex-child-fill w-full">
                {accounts.length === 0 && <div>{t('noAccounts')}</div>}
                {selectedAccount !== undefined && (
                    <>
                        <div className="account-page__address">{selectedAccount}</div>
                        <div className="account-page__routes">
                            <Outlet />
                            {canClose && (
                                <CloseButton
                                    className="account-page__close"
                                    onClick={() => nav(absoluteRoutes.home.account.path)}
                                />
                            )}
                        </div>
                    </>
                )}
            </div>
            <AccountActions className="account-page__actions" />
        </div>
    );
}

export default function AccountRoutes() {
    return (
        <Routes>
            <Route element={<Account />}>
                <Route index element={<div className="">Transaction log</div>} />
                <Route path={accountRoutes.send} element={<div>Send CCD</div>} />
                <Route path={accountRoutes.receive} element={<div>Receive CCD</div>} />
                <Route path={accountRoutes.settings} element={<AccountSettings />} />
            </Route>
        </Routes>
    );
}
