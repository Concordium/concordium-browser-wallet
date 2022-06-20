import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';

import { absoluteRoutes } from '@popup/constants/routes';
import { accountsAtom } from '@popup/store/account';
import Header from './Header';

export default function MainLayout() {
    const accounts = useAtomValue(accountsAtom);

    if (accounts.length === 0) {
        // Force user to go through setup
        return <Navigate to={absoluteRoutes.setup.path} />;
    }

    return (
        <div className="main-layout">
            <Header />
            <main className="main-layout__main">
                <Outlet />
            </main>
        </div>
    );
}
