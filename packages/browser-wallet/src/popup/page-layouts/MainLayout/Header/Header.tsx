import React from 'react';
import { useTranslation } from 'react-i18next';

export default function Header() {
    const { t } = useTranslation('mainLayout');
    return <header className="main-layout-header">{t('title')}</header>;
}
