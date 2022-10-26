import React, { useEffect, useRef } from 'react';
import { Route, Routes as ReactRoutes, useLocation, useNavigate } from 'react-router-dom';
import { InternalMessageType, MessageType, createMessageTypeFilter } from '@concordium/browser-wallet-message-hub';
import { AccountTransactionSignature } from '@concordium/web-sdk';
import { noOp } from 'wallet-common-helpers';

import { absoluteRoutes, relativeRoutes, relativePath } from '@popup/constants/routes';
import MainLayout from '@popup/page-layouts/MainLayout';
import FullscreenPromptLayout from '@popup/page-layouts/FullscreenPromptLayout';
import Account from '@popup/pages/Account';
import Identity from '@popup/pages/Identity';
import SignMessage from '@popup/pages/SignMessage';
import SendTransaction from '@popup/pages/SendTransaction';
import Setup from '@popup/pages/Setup';
import ConnectionRequest from '@popup/pages/ConnectionRequest';
import { popupMessageHandler } from '@popup/shared/message-handler';
import Settings from '@popup/pages/Settings';
import NetworkSettings from '@popup/pages/NetworkSettings';
import AddAccount from '@popup/pages/AddAccount';
import { IdentityIssuanceEnd, IdentityIssuanceStart } from '@popup/pages/IdentityIssuance';
import About from '@popup/pages/About';
import Login from '@popup/pages/Login/Login';
import RecoveryIntro from '@popup/pages/Recovery/RecoveryIntro';
import RecoveryMain from '@popup/pages/Recovery/RecoveryMain';
import RecoveryFinish from '@popup/pages/Recovery/RecoveryFinish';
import ChangePasscode from '@popup/pages/ChangePasscode/ChangePasscode';

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

/**
 * Used for internal prompt, which does not return responses to the background script
 */
function usePrompt(type: InternalMessageType | MessageType, promptKey: PromptKey) {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(
        () =>
            popupMessageHandler.handleMessage(createMessageTypeFilter(type), (msg) => {
                const replace = pathname.startsWith(absoluteRoutes.prompt.path); // replace existing prompts.
                const route = absoluteRoutes.prompt[promptKey].path;

                navigate(route, { state: msg, replace });
            }),
        [pathname]
    );
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

    usePrompt(InternalMessageType.EndIdentityIssuance, 'endIdentityIssuance');

    usePrompt(InternalMessageType.RecoveryFinished, 'recovery');

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
                <Route path={relativeRoutes.prompt.endIdentityIssuance.path} element={<IdentityIssuanceEnd />} />
                <Route path={relativeRoutes.prompt.recovery.path} element={<RecoveryFinish />} />
            </Route>
            <Route path={`${relativeRoutes.setup.path}/*`} element={<Setup />} />
            <Route element={<RecoveryMain />} path={relativeRoutes.recovery.path} />
            <Route path={relativeRoutes.login.path} element={<Login />} />
            <Route path={relativeRoutes.home.path} element={<MainLayout />}>
                <Route
                    element={<IdentityIssuanceStart />}
                    path={`${relativePath(relativeRoutes.home.path, absoluteRoutes.home.identities.add.path)}/*`}
                />
                <Route element={<Identity />} path={relativeRoutes.home.identities.path} />
                <Route path={relativeRoutes.home.settings.path}>
                    <Route index element={<Settings />} />
                    <Route element={<ChangePasscode />} path={relativeRoutes.home.settings.passcode.path} />
                    <Route element={<NetworkSettings />} path={relativeRoutes.home.settings.network.path} />
                    <Route element={<RecoveryIntro />} path={relativeRoutes.home.settings.recovery.path} />
                    <Route element={<About />} path={relativeRoutes.home.settings.about.path} />
                </Route>
                <Route
                    element={<AddAccount />}
                    path={`${relativePath(relativeRoutes.home.path, absoluteRoutes.home.account.add.path)}/*`}
                />
                <Route path={`${relativeRoutes.home.account.path}/*`} element={<Account />} />
            </Route>
        </ReactRoutes>
    );
}
