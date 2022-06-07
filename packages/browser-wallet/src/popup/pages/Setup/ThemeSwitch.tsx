import { useAtom } from 'jotai';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { themeAtom } from '@popup/store/settings';
import { Theme } from '@shared/storage/types';

export default function ThemeSwitch() {
    const { t } = useTranslation('setup');
    const [theme, setTheme] = useAtom(themeAtom);

    return (
        <div className="setup__theme">
            <b>{t('themeLabel')}</b>{' '}
            <button type="button" onClick={() => setTheme(theme === Theme.Light ? Theme.Dark : Theme.Light)}>
                {theme === Theme.Light ? t('themeLight') : t('themeDark')}
            </button>
        </div>
    );
}
