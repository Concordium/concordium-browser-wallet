import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { absoluteRoutes } from '@popup/constants/routes';

export default function MainLayout() {
    const { t } = useTranslation('mainLayout');

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
                <Outlet />
            </main>
        </>
    );
}
