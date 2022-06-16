import Button from '@popup/shared/Button';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import Logo from '@assets/svg/concordium.svg';
import clsx from 'clsx';

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
            <nav className={clsx('main-layout-header__nav', isOpen && 'main-layout-header__nav--open')}>
                <div>Accounts</div>
                <div>Identities</div>
                <div>Settings</div>
            </nav>
        </header>
    );
}
