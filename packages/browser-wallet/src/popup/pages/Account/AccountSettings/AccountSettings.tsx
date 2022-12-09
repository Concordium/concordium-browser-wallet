import React from 'react';
import NavList from '@popup/shared/NavList';
import { Link, Route, Routes } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { accountSettingsRoutes } from './routes';
import ConnectedSites from './ConnectedSites';
import ExportPrivateKey from './ExportPrivateKey';
import AccountStatement from './AccountStatement';

export function AccountSettings() {
    const { t } = useTranslation('account', { keyPrefix: 'settings' });

    return (
        <NavList className="account-settings-page">
            <Link className="account-settings-page__link" to={accountSettingsRoutes.connectedSites}>
                {t('connectedSites.title')}
            </Link>
            <Link className="account-settings-page__link" to={accountSettingsRoutes.exportPrivateKey}>
                {t('exportPrivateKey.title')}
            </Link>
            <Link className="account-settings-page__link" to={accountSettingsRoutes.accountStatement}>
                {t('accountStatement.title')}
            </Link>
        </NavList>
    );
}

export default function AccountSettingRoutes() {
    return (
        <Routes>
            <Route index element={<AccountSettings />} />
            <Route path={accountSettingsRoutes.connectedSites} element={<ConnectedSites />} />
            <Route path={accountSettingsRoutes.exportPrivateKey} element={<ExportPrivateKey />} />
            <Route path={accountSettingsRoutes.accountStatement} element={<AccountStatement />} />
        </Routes>
    );
}
