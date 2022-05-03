import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { absoluteRoutes } from '@popup/constants/routes';

export default function MainLayout() {
    return (
        <>
            <header>Concordium</header>
            <nav>
                <NavLink to={absoluteRoutes.home.path}>Home</NavLink> |{' '}
                <NavLink to={absoluteRoutes.setup.path}>Setup</NavLink>
            </nav>
            <main>
                <Outlet />
            </main>
        </>
    );
}
