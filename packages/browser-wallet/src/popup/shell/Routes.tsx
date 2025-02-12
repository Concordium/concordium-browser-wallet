import React from 'react';
import { Route, Routes as ReactRoutes } from 'react-router-dom';

import { absoluteRoutes, relativePath, relativeRoutes } from '@popup/constants/routes';
import MainLayout from '@popup/page-layouts/MainLayout';
import FullscreenPromptLayout from '@popup/page-layouts/FullscreenPromptLayout';
import Account from '@popup/pages/Account';
import Identity from '@popup/pages/Identity';
import SignMessage from '@popup/pages/SignMessage';
import SignCIS3Message from '@popup/pages/SignCIS3Message';
import SendTransaction from '@popup/pages/SendTransaction';
import Setup from '@popup/pages/Setup';
import ConnectionRequest from '@popup/pages/ConnectionRequest';
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
import AgeProofRequest from '@popup/pages/AgeProofRequest';
import ViewSeedPhrase from '@popup/pages/ViewSeedPhrase';
import { MessagePromptHandlersType } from '@popup/shared/utils/message-prompt-handlers';

export default function Routes({ messagePromptHandlers }: { messagePromptHandlers: MessagePromptHandlersType }) {
    const {
        handleConnectionResponse,
        handleConnectAccountsResponse,
        handleAddWeb3IdCredentialResponse,
        handleSendTransactionResponse,
        handleSignMessageResponse,
        handleSignCIS3MessageResponse,
        handleAddTokensResponse,
        handleIdProofResponse,
        handleWeb3IdProofResponse,
        handleAgeProofResponse,
    } = messagePromptHandlers;

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
                    path={relativeRoutes.prompt.signCIS3Message.path}
                    element={
                        <SignCIS3Message
                            onSubmit={(signature) =>
                                handleSignCIS3MessageResponse({ success: true, result: signature })
                            }
                            onReject={() =>
                                handleSignCIS3MessageResponse({ success: false, message: 'Signing was rejected' })
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
                <Route
                    path={relativeRoutes.prompt.ageProof.path}
                    element={
                        <AgeProofRequest
                            onSubmit={(proof) => handleAgeProofResponse({ success: true, result: proof })}
                            onReject={() =>
                                handleAgeProofResponse({ success: false, message: 'Proof generation was rejected' })
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
                    <Route element={<ViewSeedPhrase />} path={relativeRoutes.home.settings.seedPhrase.path} />
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
