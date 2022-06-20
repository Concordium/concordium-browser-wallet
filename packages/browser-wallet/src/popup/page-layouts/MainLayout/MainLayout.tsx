import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';

import { absoluteRoutes } from '@popup/constants/routes';
import { jsonRpcUrlAtom } from '@popup/store/settings';
import Header from './Header';

export default function MainLayout() {
    const jsonRpcUrl = useAtomValue(jsonRpcUrlAtom);

    if (!jsonRpcUrl) {
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
