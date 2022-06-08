import { themeAtom } from '@popup/store/settings';
import { Theme as ThemeType } from '@shared/storage/types';
import { Provider, useAtomValue } from 'jotai';
import React, { ReactElement, Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';

import './i18n';

import Routes from './Routes';

function Theme({ children }: { children: ReactElement }) {
    const theme = useAtomValue(themeAtom);

    useEffect(() => {
        if (theme === ThemeType.Light) {
            document.getElementsByTagName('body').item(0)?.classList.remove('dark');
        } else {
            document.getElementsByTagName('body').item(0)?.classList.add('dark');
        }
    }, [theme]);

    return children;
}

export default function Root() {
    const { t } = useTranslation();

    return (
        <Provider>
            <MemoryRouter>
                {/* The Suspense is needed here due to async atoms loading stuff from storage */}
                <Suspense fallback={t('root.loading')}>
                    <Theme>
                        <Routes />
                    </Theme>
                </Suspense>
            </MemoryRouter>
        </Provider>
    );
}
