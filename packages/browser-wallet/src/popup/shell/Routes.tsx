import React, { useEffect, useRef } from 'react';
import { Navigate, Route, Routes as ReactRoutes, useLocation, useNavigate } from 'react-router-dom';
import { InternalMessageType, MessageType, createMessageTypeFilter } from '@concordium/browser-wallet-message-hub';
import { AccountTransactionSignature } from '@concordium/web-sdk';
import { noOp } from 'wallet-common-helpers';

import { absoluteRoutes, relativeRoutes } from '@popup/constants/routes';
import MainLayout from '@popup/page-layouts/MainLayout';
import FullscreenPromptLayout from '@popup/page-layouts/FullscreenPromptLayout';
import Account from '@popup/pages/Account';
import SignMessage from '@popup/pages/SignMessage';
import SendTransaction from '@popup/pages/SendTransaction';
import Setup from '@popup/pages/Setup';
import ConnectionRequest from '@popup/pages/ConnectionRequest';
import { popupMessageHandler } from '@popup/shared/message-handler';
import Settings from '@popup/pages/Settings';
import NetworkSettings from '@popup/pages/NetworkSettings';
import VisualSettings from '@popup/pages/VisualSettings';
import AddAccount from '@popup/pages/AddAccount';

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

function NoContent() {
    return <>No content yet...</>;
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
            <Route path={relativeRoutes.home.path} element={<MainLayout />}>
                <Route path={`${relativeRoutes.home.account.path}/*`} element={<Account />} />
                <Route element={<NoContent />} path={relativeRoutes.home.identities.path} />
                <Route path={relativeRoutes.home.settings.path}>
                    <Route index element={<Settings />} />
                    <Route element={<NoContent />} path={relativeRoutes.home.settings.passcode.path} />
                    <Route element={<NetworkSettings />} path={relativeRoutes.home.settings.network.path} />
                    <Route element={<VisualSettings />} path={relativeRoutes.home.settings.visual.path} />
                    <Route element={<NoContent />} path={relativeRoutes.home.settings.about.path} />
                </Route>
                <Route
                    element={<AddAccount />}
                    path={`${relativeRoutes.home.account.path}/${relativeRoutes.home.account.add.path}`}
                />
                <Route path={`${relativeRoutes.home.account.path}/*`} element={<Account />} />
                <Route index element={<Navigate to={relativeRoutes.home.account.path} />} />
            </Route>
        </ReactRoutes>
    );
}
