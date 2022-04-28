import React from 'react';
import { Link, Outlet } from 'react-router-dom';

import { absoluteRoutes } from '@popup/constants/routes';

export default function FullscreenPromptLayout() {
    return (
        <>
            <header>
                <Link to={absoluteRoutes.home.path}>X</Link>
            </header>
            <main>
                <Outlet />
            </main>
        </>
    );
}
