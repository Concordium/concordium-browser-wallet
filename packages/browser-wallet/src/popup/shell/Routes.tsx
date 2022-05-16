import React, { useEffect } from 'react';
import { Route, Routes as ReactRoutes, useNavigate } from 'react-router-dom';

import { absoluteRoutes, relativeRoutes } from '@popup/constants/routes';
import MainLayout from '@popup/page-layouts/MainLayout';
import FullscreenPromptLayout from '@popup/page-layouts/FullscreenPromptLayout';
import Account from '@popup/pages/Account';
import SignMessage from '@popup/pages/SignMessage';
import SendTransaction from '@popup/pages/SendTransaction';
import Setup from '@popup/pages/Setup';

export default function Routes() {
    const navigate = useNavigate();

    useEffect(() => {
        // TODO use message hub to subscribe to messages.
        chrome.runtime.onMessage.addListener((msg) => {
            // TODO resolve route based on incoming message.
            navigate(absoluteRoutes.sendMessage.path, { state: msg });
        });
    }, []);

    return (
        <ReactRoutes>
            <Route path={relativeRoutes.home.path} element={<MainLayout />}>
                <Route index element={<Account />} />
            </Route>
            <Route element={<FullscreenPromptLayout />}>
                <Route path={relativeRoutes.signMessage.path} element={<SignMessage />} />
                <Route path={relativeRoutes.sendTransaction.path} element={<SendTransaction />} />
            </Route>
            <Route path={relativeRoutes.setup.path} element={<Setup />} />
        </ReactRoutes>
    );
}
