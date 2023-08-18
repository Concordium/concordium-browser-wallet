import React, { useEffect, useRef } from 'react';
import { Route, Routes as ReactRoutes, useLocation, useNavigate } from 'react-router-dom';
import {
    InternalMessageType,
    MessageType,
    createMessageTypeFilter,
    MessageStatusWrapper,
} from '@concordium/browser-wallet-message-hub';
import { AccountTransactionSignature, IdProofOutput } from '@concordium/web-sdk';
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
import TermsAndConditions from '@popup/pages/TermsAndConditions/TermsAndConditions';
import RecoveryIntro from '@popup/pages/Recovery/RecoveryIntro';
import RecoveryMain from '@popup/pages/Recovery/RecoveryMain';
import RecoveryFinish from '@popup/pages/Recovery/RecoveryFinish';
import ChangePasscode from '@popup/pages/ChangePasscode/ChangePasscode';
import AddTokensPrompt from '@popup/pages/ExternalAddTokens/ExternalAddTokens';
import IdProofRequest from '@popup/pages/IdProofRequest';
import VerifiableCredentialList from '@popup/pages/VerifiableCredential';
import Web3ProofRequest from '@popup/pages/Web3ProofRequest';
import ConnectAccountsRequest from '@popup/pages/ConnectAccountsRequest';
import AllowListRoutes from '@popup/pages/Allowlist';
import AddWeb3IdCredential from '@popup/pages/AddWeb3IdCredential/AddWeb3IdCredential';
import VerifiableCredentialImport from '@popup/pages/VerifiableCredentialBackup/VerifiableCredentialImport';

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
    const handleConnectAccountsResponse = useMessagePrompt<MessageStatusWrapper<string[]>>(
        InternalMessageType.ConnectAccounts,
        'connectAccountsRequest'
    );
    const handleAddWeb3IdCredentialResponse = useMessagePrompt<MessageStatusWrapper<string>>(
        InternalMessageType.AddWeb3IdCredential,
        'addWeb3IdCredential'
    );
    const handleSendTransactionResponse = useMessagePrompt<MessageStatusWrapper<string>>(
        InternalMessageType.SendTransaction,
        'sendTransaction'
    );
    const handleSignMessageResponse = useMessagePrompt<MessageStatusWrapper<AccountTransactionSignature>>(
        InternalMessageType.SignMessage,
        'signMessage'
    );
    const handleAddTokensResponse = useMessagePrompt<MessageStatusWrapper<string[]>>(
        InternalMessageType.AddTokens,
        'addTokens'
    );
    const handleIdProofResponse = useMessagePrompt<MessageStatusWrapper<IdProofOutput>>(
        InternalMessageType.IdProof,
        'idProof'
    );
    // We manually stringify the presentation
    const handleWeb3IdProofResponse = useMessagePrompt<MessageStatusWrapper<string>>(
        InternalMessageType.Web3IdProof,
        'web3IdProof'
    );

    usePrompt(InternalMessageType.EndIdentityIssuance, 'endIdentityIssuance');
    usePrompt(InternalMessageType.RecoveryFinished, 'recovery');
    usePrompt(InternalMessageType.ImportWeb3IdBackup, 'importWeb3IdBackup');

    useEffect(() => {
        popupMessageHandler.sendInternalMessage(InternalMessageType.PopupReady).catch(noOp);
    }, []);

    return (
        <ReactRoutes>
            <Route path={relativeRoutes.prompt.path} element={<FullscreenPromptLayout />}>
                <Route
                    path={relativeRoutes.prompt.addTokens.path}
                    element={
                        <AddTokensPrompt
                            respond={(response) => handleAddTokensResponse({ success: true, result: response })}
                        />
                    }
                />
                <Route
                    path={relativeRoutes.prompt.signMessage.path}
                    element={
                        <SignMessage
                            onSubmit={(signature) => handleSignMessageResponse({ success: true, result: signature })}
                            onReject={() =>
                                handleSignMessageResponse({ success: false, message: 'Signing was rejected' })
                            }
                        />
                    }
                />
                <Route
                    path={relativeRoutes.prompt.sendTransaction.path}
                    element={
                        <SendTransaction
                            onSubmit={(hash) => handleSendTransactionResponse({ success: true, result: hash })}
                            onReject={() =>
                                handleSendTransactionResponse({ success: false, message: 'Signing was rejected' })
                            }
                        />
                    }
                />
                <Route
                    path={relativeRoutes.prompt.addWeb3IdCredential.path}
                    element={
                        <AddWeb3IdCredential
                            onAllow={(key) => handleAddWeb3IdCredentialResponse({ success: true, result: key })}
                            onReject={() =>
                                handleAddWeb3IdCredentialResponse({
                                    success: false,
                                    message: 'Adding credential was rejected',
                                })
                            }
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
                <Route
                    path={relativeRoutes.prompt.connectAccountsRequest.path}
                    element={
                        <ConnectAccountsRequest
                            onAllow={(accountAddresses: string[]) =>
                                handleConnectAccountsResponse({ success: true, result: accountAddresses })
                            }
                            onReject={() =>
                                handleConnectAccountsResponse({
                                    success: false,
                                    message: 'Request was rejected',
                                })
                            }
                        />
                    }
                />
                <Route
                    path={relativeRoutes.prompt.idProof.path}
                    element={
                        <IdProofRequest
                            onSubmit={(proof) => handleIdProofResponse({ success: true, result: proof })}
                            onReject={() =>
                                handleIdProofResponse({ success: false, message: 'Proof generation was rejected' })
                            }
                        />
                    }
                />
                <Route
                    path={relativeRoutes.prompt.web3IdProof.path}
                    element={
                        <Web3ProofRequest
                            onSubmit={(presentationString) =>
                                handleWeb3IdProofResponse({ success: true, result: presentationString })
                            }
                            onReject={() =>
                                handleWeb3IdProofResponse({ success: false, message: 'Proof generation was rejected' })
                            }
                        />
                    }
                />
                <Route path={relativeRoutes.prompt.endIdentityIssuance.path} element={<IdentityIssuanceEnd />} />
                <Route path={relativeRoutes.prompt.recovery.path} element={<RecoveryFinish />} />
                <Route path={relativeRoutes.prompt.importWeb3IdBackup.path} element={<VerifiableCredentialImport />} />
            </Route>
            <Route path={`${relativeRoutes.setup.path}/*`} element={<Setup />} />
            <Route element={<RecoveryMain />} path={relativeRoutes.recovery.path} />
            <Route path={relativeRoutes.termsAndConditions.path} element={<TermsAndConditions />} />
            <Route path={relativeRoutes.login.path} element={<Login />} />
            <Route path={relativeRoutes.home.path} element={<MainLayout />}>
                <Route
                    element={<IdentityIssuanceStart />}
                    path={`${relativePath(relativeRoutes.home.path, absoluteRoutes.home.identities.add.path)}/*`}
                />
                <Route element={<Identity />} path={relativeRoutes.home.identities.path} />
                <Route element={<VerifiableCredentialList />} path={relativeRoutes.home.verifiableCredentials.path} />
                <Route path={relativeRoutes.home.settings.path}>
                    <Route index element={<Settings />} />
                    <Route element={<AllowListRoutes />} path={`${relativeRoutes.home.settings.allowlist.path}/*`} />
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
