import React, { useEffect, useRef } from 'react';
import { Route, Routes as ReactRoutes, useLocation, useNavigate } from 'react-router-dom';
import { HandlerType, Message, MessageType } from '@concordium/browser-wallet-message-hub';

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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const handleMessage = (msg: Message, _sender: chrome.runtime.MessageSender, respond: (r: any) => void) => {
            if (msg?.type === undefined) {
                return false;
            }

            if (msg.type === MessageType.SignMessage) {
                // TODO resolve route based on incoming message.
                connectionEventResponseRef.current = (allowed: boolean) => {
                    // eslint-disable-next-line no-console
                    console.log(allowed);
                    connectionEventResponseRef.current = undefined;
                    navigate(-1);

                    respond(allowed);
                };

                const replace = pathname === absoluteRoutes.connectionRequest.path;
                // eslint-disable-next-line no-console
                console.log(pathname, absoluteRoutes.connectionRequest.path, replace);
                navigate(absoluteRoutes.connectionRequest.path, { state: msg, replace });

                return true;
            }

            return false;
        };

        chrome.runtime.onMessage.addListener(handleMessage);

        // chrome.tabs.query({ active: true, currentWindow: true }).then(([tab]) => {
        //     console.log('TAB', tab);
        //     if (tab.id === undefined) {
        //         return;
        //     }

        //     chrome.tabs.sendMessage(tab.id, { type: MessageType.PopupReady }, handleMessage);
        // });

        chrome.runtime.sendMessage(
            new Message(HandlerType.PopupScript, HandlerType.BackgroundScript, MessageType.PopupReady)
        );

        return () => {
            chrome.runtime.onMessage.removeListener(handleMessage);
        };
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
