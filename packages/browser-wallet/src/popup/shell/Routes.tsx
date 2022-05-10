import React, { useEffect, useRef } from 'react';
import { Route, Routes as ReactRoutes, useLocation, useNavigate } from 'react-router-dom';
import { handleMessage, HandlerType, Message, MessageType, EventHandler } from '@concordium/browser-wallet-message-hub';

import { absoluteRoutes, relativeRoutes } from '@popup/constants/routes';
import MainLayout from '@popup/page-layouts/MainLayout';
import FullscreenPromptLayout from '@popup/page-layouts/FullscreenPromptLayout';
import Account from '@popup/pages/Account';
import SignMessage from '@popup/pages/SignMessage';
import SendTransaction from '@popup/pages/SendTransaction';
import Setup from '@popup/pages/Setup';
import ConnectionRequest from '@popup/pages/ConnectionRequest';

export default function Routes() {
    const navigate = useNavigate();
    const { pathname } = useLocation();
    const connectionEventResponseRef = useRef<(allowed: boolean) => void>();
    const handleConnectionResponse = (allowed: boolean) => () => {
        connectionEventResponseRef.current?.(allowed);
    };

    useEffect(() => {
        const onConnectionRequest: EventHandler = (msg, _sender, respond) => {
            // TODO resolve route based on incoming message.
            connectionEventResponseRef.current = (allowed: boolean) => {
                connectionEventResponseRef.current = undefined;
                respond(allowed);
                navigate(-1);
            };

            const replace = pathname === absoluteRoutes.connectionRequest.path;
            navigate(absoluteRoutes.connectionRequest.path, { state: msg, replace });

            return true;
        };

        const unsub = handleMessage(MessageType.SignMessage, onConnectionRequest);

        // Let bg script now that I'm ready to handle requests.
        chrome.runtime.sendMessage(new Message(HandlerType.BackgroundScript, MessageType.PopupReady));

        return unsub;
    }, [pathname]);

    return (
        <ReactRoutes>
            <Route path={relativeRoutes.home.path} element={<MainLayout />}>
                <Route index element={<Account />} />
            </Route>
            <Route element={<FullscreenPromptLayout />}>
                <Route path={relativeRoutes.signMessage.path} element={<SignMessage />} />
                <Route path={relativeRoutes.sendTransaction.path} element={<SendTransaction />} />
                <Route
                    path={relativeRoutes.connectionRequest.path}
                    element={
                        <ConnectionRequest
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
