import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { absoluteRoutes } from '@popup/constants/routes';

export default function MainLayout() {
    return (
        <>
            <header>
                <b>Prompt</b> <Link to={absoluteRoutes.home.path}>Close</Link>
            </header>
            <main>
                <Outlet />
            </main>
        </>
    );
}
