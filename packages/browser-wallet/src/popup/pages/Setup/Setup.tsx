import React from 'react';

import { absoluteRoutes } from '@popup/constants/routes';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function Setup() {
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <>
            <header>{t('title')}</header>
            <main>
                <button type="button" onClick={() => navigate(absoluteRoutes.home.path)}>
                    {t('continue')}
                </button>
            </main>
        </>
    );
}
