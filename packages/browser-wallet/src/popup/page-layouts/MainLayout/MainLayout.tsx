import React from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAtom, useAtomValue } from 'jotai';

import { absoluteRoutes } from '@popup/constants/routes';
import { keysAtom } from '@popup/store/settings';
import { selectedAccountAtom } from '@popup/store/account';

export default function MainLayout() {
    const { t } = useTranslation('mainLayout');
    const accounts = useAtomValue(keysAtom);
    const [selectedAccount, setSelectedAccount] = useAtom(selectedAccountAtom);

    if (accounts.length === 0) {
        // Force user to go through setup
        return <Navigate to={absoluteRoutes.setup.path} />;
    }

    return (
        <>
            <header>
                <h4>{t('title')}</h4>
            </header>
            <nav>
                <NavLink to={absoluteRoutes.home.path}>{t('nav.home')}</NavLink> |{' '}
                <NavLink to={absoluteRoutes.setup.path}>{t('nav.setup')}</NavLink>
            </nav>
            <main>
                <select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)}>
                    {accounts.map((a) => (
                        <option key={a} value={a}>
                            {a}
                        </option>
                    ))}
                </select>
                <Outlet />
            </main>
        </>
    );
}
