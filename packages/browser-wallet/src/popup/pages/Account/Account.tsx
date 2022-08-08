import { useAtomValue } from 'jotai';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, Route, Routes } from 'react-router-dom';
import { accountsAtom, selectedAccountAtom } from '@popup/store/account';
import MenuButton from '@popup/shared/MenuButton';
import { accountRoutes } from './routes';
import AccountActions from './AccountActions';
import DisplayAddress from './DisplayAddress';
import AccountDetails from './AccountDetails';
import AccountSettings from './AccountSettings';

function Account() {
    const { t } = useTranslation('account');
    const accounts = useAtomValue(accountsAtom);
    const selectedAccount = useAtomValue(selectedAccountAtom);
    const [detailsExpanded, setDetailsExpanded] = useState(true);

    return (
        <div className="flex-column justify-space-between align-center h-full relative">
            <div className="account-page__content">
                {accounts.length === 0 && <div>{t('noAccounts')}</div>}
                {selectedAccount !== undefined && (
                    <>
                        <div className="account-page__details">
                            <MenuButton
                                className="account-page__hide"
                                open={detailsExpanded}
                                onClick={() => setDetailsExpanded((o) => !o)}
                            />
                            <AccountDetails expanded={detailsExpanded} account={selectedAccount} />
                        </div>
                        <div className="account-page__routes">
                            <Outlet />
                        </div>
                    </>
                )}
            </div>
            <AccountActions className="account-page__actions" setDetailsExpanded={setDetailsExpanded} />
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
                <Route path={`${accountRoutes.settings}/*`} element={<AccountSettings />} />
            </Route>
        </Routes>
    );
}
