import clsx from 'clsx';
import { useAtom, useAtomValue } from 'jotai';
import React, { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';

import { accountsAtom, selectedAccountAtom } from '@popup/store/account';
import Button from '@popup/shared/Button';
import { credentialsAtom, urlWhitelistAtom } from '@popup/store/settings';
import CloseButton from '@popup/shared/CloseButton';
import { absoluteRoutes } from '@popup/constants/routes';
import MenuButton from '@popup/shared/MenuButton';
import { accountRoutes } from './routes';
import AccountActions from './AccountActions';
import DisplayAddress from './DisplayAddress';

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
    const [detailsExpanded, setDetailsExpanded] = useState(true);

    const canClose = pathname !== absoluteRoutes.home.account.path;

    return (
        <div className="flex-column justify-space-between align-center h-full relative">
            <MenuButton
                className="account-page__hide"
                open={detailsExpanded}
                onClick={() => setDetailsExpanded((o) => !o)}
            />
            <div className="account-page__content">
                {accounts.length === 0 && <div>{t('noAccounts')}</div>}
                {selectedAccount !== undefined && (
                    <>
                        <div
                            className={clsx(
                                'account-page__details',
                                detailsExpanded && 'account-page__details--expanded'
                            )}
                        >
                            {selectedAccount}
                        </div>
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
                <Route index element={<div>Transaction log</div>} />
                <Route path={accountRoutes.send} element={<div>Send CCD</div>} />
                <Route path={accountRoutes.receive} element={<DisplayAddress />} />
                <Route path={accountRoutes.settings} element={<AccountSettings />} />
            </Route>
        </Routes>
    );
}
