import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import clsx from 'clsx';

import { absoluteRoutes } from '@popup/constants/routes';
import { jsonRpcUrlAtomLoading } from '@popup/store/settings';
import Header from './Header';

export default function MainLayout() {
    const { loading, value: jsonRpcUrl } = useAtomValue(jsonRpcUrlAtomLoading);
    const [headerOpen, setHeaderOpen] = useState(false);

    if (loading) {
        // This will be near instant, as we're just waiting for the chrome async store
        return null;
    }

    if (!jsonRpcUrl) {
        // Force user to go through setup
        return <Navigate to={absoluteRoutes.setup.path} />;
    }

    return (
        <div className="main-layout">
            <Header className="main-layout__header" onToggle={setHeaderOpen} />
            <main className={clsx('main-layout__main', headerOpen && 'main-layout__main--blur')}>
                <Outlet />
            </main>
        </div>
    );
}
