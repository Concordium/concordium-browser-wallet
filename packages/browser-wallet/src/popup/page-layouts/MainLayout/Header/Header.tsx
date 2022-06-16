import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { NavLink } from 'react-router-dom';

import Logo from '@assets/svg/concordium.svg';
import NavList from '@popup/shared/NavList';
import Button from '@popup/shared/Button';
import { absoluteRoutes } from '@popup/constants/routes';

export default function Header() {
    const { t } = useTranslation('mainLayout');
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className={clsx('main-layout-header', isOpen && 'main-layout-header--open')}>
            <div className="main-layout-header__bar">
                <Button className="main-layout-header__logo" clear onClick={() => setIsOpen((o) => !o)}>
                    <Logo />
                </Button>
                <h1>{t('title')}</h1>
            </div>
            <NavList className="main-layout-header__nav">
                <NavLink
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                        clsx('main-layout-header__nav-item', isActive && 'main-layout-header__nav-item--active')
                    }
                    to={absoluteRoutes.home.path}
                >
                    Accounts
                </NavLink>
                <NavLink
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                        clsx('main-layout-header__nav-item', isActive && 'main-layout-header__nav-item--active')
                    }
                    to={absoluteRoutes.home.identities.path}
                >
                    Identities
                </NavLink>
                <NavLink
                    onClick={() => setIsOpen(false)}
                    className={({ isActive }) =>
                        clsx('main-layout-header__nav-item', isActive && 'main-layout-header__nav-item--active')
                    }
                    to={absoluteRoutes.home.settings.path}
                >
                    Settings
                </NavLink>
            </NavList>
        </header>
    );
}
