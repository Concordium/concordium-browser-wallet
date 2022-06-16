import Button from '@popup/shared/Button';
import React from 'react';
import { useTranslation } from 'react-i18next';

import Logo from '@assets/svg/concordium.svg';

export default function Header() {
    const { t } = useTranslation('mainLayout');
    return (
        <header className="main-layout-header">
            <Button className="main-layout-header__logo" clear>
                <Logo />
            </Button>
            <h1>{t('title')}</h1>
        </header>
    );
}
