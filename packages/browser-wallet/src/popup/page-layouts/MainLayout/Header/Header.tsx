import Button from '@popup/shared/Button';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Logo from '@assets/svg/concordium.svg';
import clsx from 'clsx';
import NavList from '@popup/shared/NavList';

export default function Header() {
    const { t } = useTranslation('mainLayout');
    const [isOpen, setIsOpen] = useState(false);

    return (
        <header className="main-layout-header">
            <div className="main-layout-header__bar">
                <Button className="main-layout-header__logo" clear onClick={() => setIsOpen((o) => !o)}>
                    <Logo />
                </Button>
                <h1>{t('title')}</h1>
            </div>
            <NavList className={clsx('main-layout-header__nav', isOpen && 'main-layout-header__nav--open')}>
                <div className="main-layout-header__nav-item">Accounts</div>
                <div className="main-layout-header__nav-item">Identities</div>
                <div className="main-layout-header__nav-item">Settings</div>
            </NavList>
        </header>
    );
}
