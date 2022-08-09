import React from 'react';
import NavList from '@popup/shared/NavList';
import { Link, Route, Routes } from 'react-router-dom';
import { useAtom, useAtomValue } from 'jotai';
import { selectedAccountAtom, storedConnectedSitesAtom } from '@popup/store/account';
import Button from '@popup/shared/Button';
import { accountSettingsRoutes } from './routes';

export function AccountSettings() {
    return (
        <NavList className="account-settings-page">
            <Link className="account-settings-page__link" to={accountSettingsRoutes.connectedSites}>
                Connected sites
            </Link>
            <Link className="account-settings-page__link" to={accountSettingsRoutes.exportPrivateKey}>
                Export private key
            </Link>
        </NavList>
    );
}

function ConnectedSites() {
    const selectedAccount = useAtomValue(selectedAccountAtom);
    const [connectedSites, setConnectedSites] = useAtom(storedConnectedSitesAtom);
    const localSites = selectedAccount ? connectedSites[selectedAccount] : undefined;

    if (localSites === undefined || selectedAccount === undefined) {
        return (
            <div className="connected-sites-list">
                <div className="connected-sites-list__element">The selected account is not connected to any sites.</div>
            </div>
        );
    }

    function updateSites(site: string, account?: string) {
        if (!account) {
            throw new Error('This never happens');
        }

        const currentValue = connectedSites[account] ? connectedSites[account] : [];
        const updatedValue = currentValue.filter((v) => v !== site);

        const newValue = {
            ...connectedSites,
        };
        newValue[account] = updatedValue;
        setConnectedSites(newValue);
    }

    return (
        <div className="connected-sites-list">
            {localSites.map((site) => {
                return (
                    <div className="connected-sites-list__element" key={site}>
                        <div>{site}</div>
                        <Button
                            clear
                            className="connected-sites-list__element__disconnect"
                            onClick={() => updateSites(site, selectedAccount)}
                        >
                            Disconnect
                        </Button>
                    </div>
                );
            })}
        </div>
    );
}

export default function AccountSettingRoutes() {
    return (
        <Routes>
            <Route index element={<AccountSettings />} />
            <Route path={accountSettingsRoutes.connectedSites} element={<ConnectedSites />} />
            <Route path={accountSettingsRoutes.exportPrivateKey} element={<div>Export private key</div>} />
        </Routes>
    );
}
