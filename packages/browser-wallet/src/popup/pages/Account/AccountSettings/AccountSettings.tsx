import React from 'react';
import NavList from '@popup/shared/NavList';
import { Link, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { accountSettingsRoutes } from './routes';
import ConnectedSites from './ConnectedSites';

export function AccountSettings() {
    const { t: tc } = useTranslation('account', { keyPrefix: 'settings.connectedSites' });
    const { t } = useTranslation('account', { keyPrefix: 'settings' });

    return (
        <NavList className="account-settings-page">
            <Link className="account-settings-page__link" to={accountSettingsRoutes.connectedSites}>
                {tc('title')}
            </Link>
            <Link className="account-settings-page__link" to={accountSettingsRoutes.exportPrivateKey}>
                {t('exportPrivateKey')}
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
