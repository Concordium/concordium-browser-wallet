import React from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAtom, useAtomValue } from 'jotai';

import { absoluteRoutes } from '@popup/constants/routes';
import { selectedAccountAtom, accountsAtom } from '@popup/store/account';
import Header from './Header';

export default function MainLayout() {
    const { t } = useTranslation('mainLayout');
    const accounts = useAtomValue(accountsAtom);
    const [selectedAccount, setSelectedAccount] = useAtom(selectedAccountAtom);

    if (accounts.length === 0) {
        // Force user to go through setup
        return <Navigate to={absoluteRoutes.setup.path} />;
    }

    return (
        <div className="main-layout">
            <Header />
            <main className="main-layout__main">
                <nav className="main-layout__nav">
                    <NavLink to={absoluteRoutes.home.path}>{t('nav.home')}</NavLink> |{' '}
                    <NavLink to={absoluteRoutes.setup.path}>{t('nav.setup')}</NavLink>
                </nav>
                <select
                    className="main-layout__select-account"
                    value={selectedAccount}
                    onChange={(e) => setSelectedAccount(e.target.value)}
                >
                    {accounts.map((a) => (
                        <option key={a} value={a}>
                            {a}
                        </option>
                    ))}
                </select>
                <div className="main-layout__content">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
