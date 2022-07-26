import { useAtom } from 'jotai';
import React from 'react';
import { useTranslation } from 'react-i18next';

import { themeAtom } from '@popup/store/settings';
import { Theme } from '@shared/storage/types';

export default function NetworkSettings() {
    const { t } = useTranslation('visualSettings');
    const [theme, setTheme] = useAtom(themeAtom);

    return (
        <>
            {t('label')}{' '}
            <select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
                <option value={Theme.Light}>{t('values.light')}</option>
                <option value={Theme.Dark}>{t('values.dark')}</option>
            </select>
        </>
    );
}
