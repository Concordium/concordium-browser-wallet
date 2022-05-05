import React from 'react';
import { Link, Outlet } from 'react-router-dom';

import { absoluteRoutes } from '@popup/constants/routes';

export default function FullscreenPromptLayout() {
    return (
        <div className="fullscreen-prompt-layout">
            <Link className="fullscreen-prompt-layout__close" to={absoluteRoutes.home.path}>
                X
            </Link>
            <main>
                <Outlet />
            </main>
        </div>
    );
}
