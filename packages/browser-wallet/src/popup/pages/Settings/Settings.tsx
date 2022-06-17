import React from 'react';
import { Link } from 'react-router-dom';

import { absoluteRoutes } from '@popup/constants/routes';
import NavList from '@popup/shared/NavList';

export default function Settings() {
    return (
        <NavList>
            <Link className="settings-page__link" to={absoluteRoutes.home.settings.passcode.path}>
                Change passcode
            </Link>
            <Link className="settings-page__link" to={absoluteRoutes.home.settings.network.path}>
                Network settings
            </Link>
            <Link className="settings-page__link" to={absoluteRoutes.home.settings.visual.path}>
                Visual settings
            </Link>
            <Link className="settings-page__link" to={absoluteRoutes.home.settings.support.path}>
                Support
            </Link>
            <Link className="settings-page__link" to={absoluteRoutes.home.settings.about.path}>
                About
            </Link>
        </NavList>
    );
}
