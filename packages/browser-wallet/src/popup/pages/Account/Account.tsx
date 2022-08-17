import { useAtomValue } from 'jotai';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, Route, Routes } from 'react-router-dom';
import { accountsAtom, selectedAccountAtom, storedConnectedSitesAtom } from '@popup/store/account';
import MenuButton from '@popup/shared/MenuButton';
import { getCurrentOpenTabUrl } from '@popup/shared/utils/tabs';
import clsx from 'clsx';
import { accountRoutes } from './routes';
import { accountSettingsRoutes } from './AccountSettings/routes';
import AccountActions from './AccountActions';
import DisplayAddress from './DisplayAddress';
import TransactionList from './TransactionList';
import AccountDetails from './AccountDetails';
import AccountSettings from './AccountSettings';

function ConnectedBox({ setDetailsExpanded }: { setDetailsExpanded: React.Dispatch<React.SetStateAction<boolean>> }) {
    const { t } = useTranslation('account');
    const connectedSites = useAtomValue(storedConnectedSitesAtom);
    const selectedAccount = useAtomValue(selectedAccountAtom);
    const [isConnectedToSite, setIsConnectedToSite] = useState<boolean>();

    useMemo(() => {
        if (selectedAccount && !connectedSites.loading) {
            getCurrentOpenTabUrl().then((url) => {
                if (url) {
                    const connectedSitesForAccount = connectedSites.value[selectedAccount] ?? [];
                    setIsConnectedToSite(connectedSitesForAccount.includes(url));
                }
            });
        }
    }, [selectedAccount, connectedSites]);

    return (
        <Link
            className={clsx('account-page__connection-box', !isConnectedToSite && 'account-page__not-connected')}
            to={`${accountRoutes.settings}/${accountSettingsRoutes.connectedSites}`}
            onClick={() => setDetailsExpanded(false)}
        >
            {isConnectedToSite ? t('siteConnected') : t('siteNotConnected')}
        </Link>
    );
}

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
                            <ConnectedBox setDetailsExpanded={setDetailsExpanded} />
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
                <Route index element={<TransactionList />} />
                <Route path={accountRoutes.send} element={<div>Send CCD</div>} />
                <Route path={accountRoutes.receive} element={<DisplayAddress />} />
                <Route path={`${accountRoutes.settings}/*`} element={<AccountSettings />} />
            </Route>
        </Routes>
    );
}
