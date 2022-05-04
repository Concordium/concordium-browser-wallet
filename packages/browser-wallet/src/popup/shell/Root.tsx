import { Provider } from 'jotai';
import React, { Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';

import './i18n';

import Routes from './Routes';

export default function Root() {
    const { t } = useTranslation();

    return (
        <Provider>
            <MemoryRouter>
                <Suspense fallback={t('root.loading')}>
                    <Routes />
                </Suspense>
            </MemoryRouter>
        </Provider>
    );
}
