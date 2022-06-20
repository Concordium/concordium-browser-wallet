import React, { useEffect, useRef } from 'react';
import { Navigate, Route, Routes as ReactRoutes, useLocation, useNavigate } from 'react-router-dom';
import { InternalMessageType, MessageType, createMessageTypeFilter } from '@concordium/browser-wallet-message-hub';
import { AccountTransactionSignature } from '@concordium/web-sdk';

import { absoluteRoutes, relativeRoutes } from '@popup/constants/routes';
import MainLayout from '@popup/page-layouts/MainLayout';
import FullscreenPromptLayout from '@popup/page-layouts/FullscreenPromptLayout';
import Account from '@popup/pages/Account';
import SignMessage from '@popup/pages/SignMessage';
import SendTransaction from '@popup/pages/SendTransaction';
import Setup from '@popup/pages/Setup';
import ConnectionRequest from '@popup/pages/ConnectionRequest';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { noOp } from '@shared/utils/basic-helpers';

type PromptKey = keyof Omit<typeof absoluteRoutes['prompt'], 'path'>;

function useMessagePrompt<R>(type: InternalMessageType | MessageType, promptKey: PromptKey) {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const eventResponseRef = useRef<(response: R) => void>();
    const handleResponse = (response: R) => {
        eventResponseRef.current?.(response);
    };

    useEffect(
        () =>
            popupMessageHandler.handleMessage(createMessageTypeFilter(type), (msg, _sender, respond) => {
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
    const handleConnectionResponse = useMessagePrompt<boolean>(InternalMessageType.Connect, 'connectionRequest');
    const handleSendTransactionResponse = useMessagePrompt<string | undefined>(
        InternalMessageType.SendTransaction,
        'sendTransaction'
    );
    const handleSignMessageResponse = useMessagePrompt<AccountTransactionSignature | undefined>(
        InternalMessageType.SignMessage,
        'signMessage'
    );

    useEffect(() => {
        popupMessageHandler.sendInternalMessage(InternalMessageType.PopupReady).catch(noOp);
    }, []);

    return (
        <ReactRoutes>
            <Route path={relativeRoutes.home.path} element={<MainLayout />}>
                <Route index element={<Account />} />
                <Route element={<div>No content yet...</div>} path={relativeRoutes.home.identities.path} />
                <Route
                    element={<Navigate replace to={absoluteRoutes.setup.path} />}
                    path={relativeRoutes.home.settings.path}
                />
            </Route>
            <Route path={relativeRoutes.prompt.path} element={<FullscreenPromptLayout />}>
                <Route
                    path={relativeRoutes.prompt.signMessage.path}
                    element={
                        <SignMessage
                            onSubmit={handleSignMessageResponse}
                            onReject={() => handleSignMessageResponse(undefined)}
                        />
                    }
                />
                <Route
                    path={relativeRoutes.prompt.sendTransaction.path}
                    element={
                        <SendTransaction
                            onSubmit={handleSendTransactionResponse}
                            onReject={() => handleSendTransactionResponse(undefined)}
                        />
                    }
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
