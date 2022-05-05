import React, { useEffect, useRef } from 'react';
import { Route, Routes as ReactRoutes, useNavigate } from 'react-router-dom';

import { absoluteRoutes, relativeRoutes } from '@popup/constants/routes';
import MainLayout from '@popup/page-layouts/MainLayout';
import FullscreenPromptLayout from '@popup/page-layouts/FullscreenPromptLayout';
import Account from '@popup/pages/Account';
import SignMessage from '@popup/pages/SignMessage';
import SendTransaction from '@popup/pages/SendTransaction';
import Setup from '@popup/pages/Setup';
import AllowConnection from '@popup/pages/AllowConnection';

export default function Routes() {
    const navigate = useNavigate();
    const connectionEventResponseRef = useRef<(allowed: boolean) => void>();
    const handleConnectionResponse = (allowed: boolean) => () => {
        connectionEventResponseRef.current?.(allowed);
    };

    useEffect(() => {
        // TODO use message hub to subscribe to messages.
        chrome.runtime.onMessage.addListener((msg) => {
            // TODO resolve route based on incoming message.
            connectionEventResponseRef.current = (allowed: boolean) => {
                // eslint-disable-next-line no-console
                console.log(allowed);
                connectionEventResponseRef.current = undefined;
                navigate(-1);
            };
            navigate(absoluteRoutes.allowConnection.path, { state: msg });
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
                <Route
                    path={relativeRoutes.allowConnection.path}
                    element={
                        <AllowConnection
                            onAllow={handleConnectionResponse(true)}
                            onReject={handleConnectionResponse(false)}
                        />
                    }
                />
            </Route>
            <Route path={relativeRoutes.setup.path} element={<Setup />} />
        </ReactRoutes>
    );
}
