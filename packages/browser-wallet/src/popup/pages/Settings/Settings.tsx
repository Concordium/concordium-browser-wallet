import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import { absoluteRoutes } from '@popup/constants/routes';
import NavList from '@popup/shared/NavList';

export default function Settings() {
    const { t } = useTranslation('settings');

    return (
        <NavList>
            <Link className="settings-page__link" to={absoluteRoutes.home.settings.passcode.path}>
                {t('passcode')}
            </Link>
            <Link className="settings-page__link" to={absoluteRoutes.home.settings.network.path}>
                {t('network')}
            </Link>
            <Link className="settings-page__link" to={absoluteRoutes.home.settings.visual.path}>
                {t('visual')}
            </Link>
            <Link className="settings-page__link" to={absoluteRoutes.home.settings.about.path}>
                {t('about')}
            </Link>
        </NavList>
    );
}
