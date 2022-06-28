import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import clsx from 'clsx';

import { absoluteRoutes } from '@popup/constants/routes';
import { jsonRpcUrlAtom } from '@popup/store/settings';
import Header from './Header';

export default function MainLayout() {
    const jsonRpcUrl = useAtomValue(jsonRpcUrlAtom);
    const [headerOpen, setHeaderOpen] = useState(false);

    if (!jsonRpcUrl) {
        // Force user to go through setup
        return <Navigate to={absoluteRoutes.setup.path} />;
    }

    return (
        <div className="main-layout">
            <Header onToggle={setHeaderOpen} />
            <main className={clsx('main-layout__main', headerOpen && 'main-layout__main--blur')}>
                <Outlet />
            </main>
        </div>
    );
}
