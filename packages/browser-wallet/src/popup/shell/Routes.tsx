import React, { useEffect, useRef } from 'react';
import { Route, Routes as ReactRoutes, useLocation, useNavigate } from 'react-router-dom';
import { EventType, createEventTypeFilter } from '@concordium/browser-wallet-message-hub';

import { absoluteRoutes, relativeRoutes } from '@popup/constants/routes';
import MainLayout from '@popup/page-layouts/MainLayout';
import FullscreenPromptLayout from '@popup/page-layouts/FullscreenPromptLayout';
import Account from '@popup/pages/Account';
import SignMessage from '@popup/pages/SignMessage';
import SendTransaction from '@popup/pages/SendTransaction';
import Setup from '@popup/pages/Setup';
import ConnectionRequest from '@popup/pages/ConnectionRequest';
import { popupMessageHandler } from '@popup/shared/message-handler';

type PromptKey = keyof Omit<typeof absoluteRoutes['prompt'], 'path'>;

function useEventPrompt<R>(eventType: EventType, promptKey: PromptKey) {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const eventResponseRef = useRef<(response: R) => void>();
    const handleResponse = (response: R) => {
        eventResponseRef.current?.(response);
    };

    useEffect(
        () =>
            popupMessageHandler.handleMessage(createEventTypeFilter(eventType), (msg, _sender, respond) => {
                eventResponseRef.current = respond;

                const replace = pathname.startsWith(absoluteRoutes.prompt.path); // replace existing prompts.
                const route = absoluteRoutes.prompt[promptKey].path;

                navigate(route, { state: msg, replace });
                return true;
            }),
        [pathname]
    );

    return handleResponse;
}

export default function Routes() {
    const handleConnectionResponse = useEventPrompt<boolean>(EventType.Connect, 'connectionRequest');
    const handleSendTransactionResponse = useEventPrompt<void>(EventType.SendTransaction, 'sendTransaction');
    const handleSignMessageResponse = useEventPrompt<void>(EventType.SendTransaction, 'signMessage');

    useEffect(() => {
        popupMessageHandler.sendInternalEvent(EventType.PopupReady);
    }, []);

    return (
        <ReactRoutes>
            <Route path={relativeRoutes.home.path} element={<MainLayout />}>
                <Route index element={<Account />} />
            </Route>
            <Route path={relativeRoutes.prompt.path} element={<FullscreenPromptLayout />}>
                <Route
                    path={relativeRoutes.prompt.signMessage.path}
                    element={<SignMessage onSubmit={handleSignMessageResponse} />}
                />
                <Route
                    path={relativeRoutes.prompt.sendTransaction.path}
                    element={<SendTransaction onSubmit={handleSendTransactionResponse} />}
                />
                <Route
                    path={relativeRoutes.prompt.connectionRequest.path}
                    element={
                        <ConnectionRequest
                            onAllow={() => handleConnectionResponse(true)}
                            onReject={() => handleConnectionResponse(false)}
                        />
                    }
                />
            </Route>
            <Route path={relativeRoutes.setup.path} element={<Setup />} />
        </ReactRoutes>
    );
}
