import React from 'react';
import NavList from '@popup/shared/NavList';
import { Link, Route, Routes } from 'react-router-dom';
import { accountSettingsRoutes } from './routes';
import ConnectedSites from './ConnectedSites';

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

export default function AccountSettingRoutes() {
    return (
        <Routes>
            <Route index element={<AccountSettings />} />
            <Route path={accountSettingsRoutes.connectedSites} element={<ConnectedSites />} />
            <Route path={accountSettingsRoutes.exportPrivateKey} element={<div>Export private key</div>} />
        </Routes>
    );
}
