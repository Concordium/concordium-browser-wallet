import { useAtomValue } from 'jotai';
import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, Outlet, Route, Routes } from 'react-router-dom';
import { accountsAtom, selectedAccountAtom, storedConnectedSitesAtom } from '@popup/store/account';
import MenuButton from '@popup/shared/MenuButton';
import { getCurrentOpenTabUrl } from '@popup/shared/utils/tabs';
import clsx from 'clsx';
import { useSelectedCredential } from '@popup/shared/utils/account-helpers';
import { CreationStatus } from '@shared/storage/types';
import { accountRoutes } from './routes';
import { accountSettingsRoutes } from './AccountSettings/routes';
import AccountActions from './AccountActions';
import DisplayAddress from './DisplayAddress';
import AccountDetails from './AccountDetails';
import AccountSettings from './AccountSettings';
import TransactionLog from './TransactionLog/TransactionLog';
import SendCcd from './SendCcd';

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

function Account({
    detailsExpanded,
    setDetailsExpanded,
}: {
    detailsExpanded: boolean;
    setDetailsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}) {
    const { t } = useTranslation('account');
    const accounts = useAtomValue(accountsAtom);

    const selectedCred = useSelectedCredential();

    const isConfirmed = !selectedCred || selectedCred.status === CreationStatus.Confirmed;

    return (
        <div className="flex-column justify-space-between align-center h-full relative">
            <div className="account-page__content">
                {accounts.length === 0 && <div>{t('noAccounts')}</div>}
                {selectedCred !== undefined && (
                    <>
                        <div className="account-page__details">
                            <MenuButton
                                className="account-page__hide"
                                open={detailsExpanded}
                                onClick={() => setDetailsExpanded((o) => !o)}
                            />
                            <AccountDetails expanded={detailsExpanded} account={selectedCred} />
                            <ConnectedBox setDetailsExpanded={setDetailsExpanded} />
                        </div>
                        <div className="account-page__routes">
                            {isConfirmed && <Outlet />}
                            {!isConfirmed && <div className="account-page__not-finalized">{t('accountPending')}</div>}
                        </div>
                    </>
                )}
            </div>
            <AccountActions
                className="account-page__actions"
                disabled={!isConfirmed}
                setDetailsExpanded={setDetailsExpanded}
            />
        </div>
    );
}

export default function AccountRoutes() {
    const [detailsExpanded, setDetailsExpanded] = useState(true);

    return (
        <Routes>
            <Route element={<Account detailsExpanded={detailsExpanded} setDetailsExpanded={setDetailsExpanded} />}>
                <Route index element={<TransactionLog setDetailsExpanded={setDetailsExpanded} />} />
                <Route path={`${accountRoutes.send}/*`} element={<SendCcd setDetailsExpanded={setDetailsExpanded} />} />
                <Route path={accountRoutes.receive} element={<DisplayAddress />} />
                <Route path={`${accountRoutes.settings}/*`} element={<AccountSettings />} />
            </Route>
        </Routes>
    );
}
