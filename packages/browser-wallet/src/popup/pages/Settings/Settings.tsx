import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { absoluteRoutes } from '@popup/constants/routes';
import NavList from '@popup/shared/NavList';
import { ToggleCheckbox } from '@popup/shared/Form/ToggleCheckbox';
import { useAtom } from 'jotai';
import { themeAtom } from '@popup/store/settings';
import { Theme } from '@shared/storage/types';

export default function Settings() {
    const { t } = useTranslation('settings');
    const [theme, setTheme] = useAtom(themeAtom);

    return (
        <div className="settings-page">
            <NavList>
                <Link className="settings-page__link" to={absoluteRoutes.home.settings.passcode.path}>
                    {t('passcode')}
                </Link>
                <Link className="settings-page__link" to={absoluteRoutes.home.settings.network.path}>
                    {t('network')}
                </Link>
                <Link className="settings-page__link" to={absoluteRoutes.home.settings.about.path}>
                    {t('about')}
                </Link>
            </NavList>
            <ToggleCheckbox
                className="settings-page__toggle"
                onChange={() => (theme === Theme.Light ? setTheme(Theme.Dark) : setTheme(Theme.Light))}
            />
        </div>
    );
}
