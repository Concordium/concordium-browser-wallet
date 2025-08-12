import React from 'react';
import { Route, Routes as ReactRoutes } from 'react-router-dom';
import { relativeRoutes, routePrefix } from '@popup/popupX/constants/routes';
import MainLayout, { OnboardingLayout } from '@popup/popupX/page-layouts/MainLayout';
import MainPage from '@popup/popupX/pages/MainPage';
import { SendFunds } from '@popup/popupX/pages/SendFunds';
import ReceiveFunds from '@popup/popupX/pages/ReceiveFunds';
import Onramp from '@popup/popupX/pages/Onramp';
import TransactionLog from '@popup/popupX/pages/TransactionLog';
import TransactionDetails from '@popup/popupX/pages/TransactionLog/TransactionDetails';
import { TokenDetails, TokenDetailsCcd, TokenDetailsPlt, TokenRaw } from '@popup/popupX/pages/TokenDetails';
import IdCards from '@popup/popupX/pages/IdCards';
import Accounts from '@popup/popupX/pages/Accounts';
import CreateAccount, { CreateAccountConfirm } from '@popup/popupX/pages/CreateAccount';
import SeedPhrase from 'src/popup/popupX/pages/SeedPhrase';
import ChangePasscode from 'src/popup/popupX/pages/ChangePasscode';
import { Web3IdCredentials, Web3IdImport } from '@popup/popupX/pages/Web3Id';
import NetworkSettings from '@popup/popupX/pages/NetworkSettings';
import { ConnectNetwork, CustomConnectNetwork } from '@popup/popupX/pages/ConnectNetwork';
import About from '@popup/popupX/pages/About';
import {
    ConfirmSeedPhrase,
    CreateOrRestore,
    GenerateSeedPhrase,
    IdCardsInfo,
    RestoreWallet,
    SelectNetwork,
    SetupPassword,
    Welcome,
} from '@popup/popupX/pages/Onboarding';
import ConnectedSites from '@popup/popupX/pages/ConnectedSites';
import EarningRewards from '@popup/popupX/pages/EarningRewards';
import ValidatorIntro from '@popup/popupX/pages/EarningRewards/Validator/Intro';
import PrivateKey from '@popup/popupX/pages/PrivateKey';
import { RestoreIntro, RestoreMain, RestoreResult } from '@popup/popupX/pages/Restore';
import { MessagePromptHandlersType } from '@popup/shared/utils/message-prompt-handlers';
import ConnectionRequest from '@popup/popupX/pages/prompts/ConnectionRequest';
import ConnectAccount from '@popup/popupX/pages/prompts/ConnectAccount';
import AddTokens from '@popup/popupX/pages/prompts/AddTokens';
import SignCis3Message from '@popup/popupX/pages/prompts/SignCis3Message';
import SignMessage from '@popup/popupX/pages/prompts/SignMessage';
import SendTransaction from '@popup/popupX/pages/prompts/SendTransaction';
import ExternalRequestLayout from '@popup/popupX/page-layouts/ExternalRequestLayout';
import { AddToken, ManageTokenList } from '@popup/popupX/pages/ManageTokens';
import { Nft, NftDetails, NftRaw } from 'src/popup/popupX/pages/Nft';
import SelfSuspend from '@popup/popupX/pages/EarningRewards/Validator/SelfSuspend';
import { DelegationResult } from '../pages/EarningRewards/Delegator/Result';
import SubmittedTransaction from '../pages/SubmittedTransaction';
import { DelegatorIntro } from '../pages/EarningRewards/Delegator/Intro';
import {
    RegisterDelegatorTransactionFlow,
    UpdateDelegatorTransactionFlow,
} from '../pages/EarningRewards/Delegator/TransactionFlow';
import DelegatorStatus from '../pages/EarningRewards/Delegator/Status';
import ValidatorStatus from '../pages/EarningRewards/Validator/Status';
import {
    RegisterValidatorTransactionFlow,
    UpdateValidatorKeysTransactionFlow,
    UpdateValidatorPoolSettingsTransactionFlow,
    UpdateValidatorStakeTransactionFlow,
} from '../pages/EarningRewards/Validator/TransactionFlow';
import ValidationResult from '../pages/EarningRewards/Validator/Result/ValidationResult';
import UpdateValidator from '../pages/EarningRewards/Validator/Update';
import IdIssuance from '../pages/IdIssuance';
import IdIssuanceSubmitted from '../pages/IdIssuance/Submitted';
import IdIssuanceExternalFlow from '../pages/IdIssuance/ExternalFlow';
import IdIssuanceFailed from '../pages/IdIssuance/Failed';
import EndIdentityIssuance from '../pages/prompts/EndIdentityIssuance';
import Web3IdDetails from '../pages/Web3Id/Web3IdDetails';
import AddWeb3IdCredential from '../pages/prompts/AddWeb3IdCredential';
import VerifiablePresentationRequest from '../pages/prompts/VerifiablePresentationRequest/VerifiablePresentationRequest';
import IdProofRequest from '../pages/prompts/IdProofRequest';

export default function Routes({ messagePromptHandlers }: { messagePromptHandlers: MessagePromptHandlersType }) {
    const {
        handleConnectionResponse,
        handleConnectAccountsResponse,
        handleAddTokensResponse,
        handleSignCIS3MessageResponse,
        handleSignMessageResponse,
        handleSendTransactionResponse,
        handleAddWeb3IdCredentialResponse,
        handleWeb3IdProofResponse,
        handleIdProofResponse,
        handleAgeProofResponse,
    } = messagePromptHandlers;
    return (
        <ReactRoutes>
            <Route path={routePrefix}>
                <Route element={<OnboardingLayout />} path={relativeRoutes.onboarding.path}>
                    <Route index element={<Welcome />} />
                    <Route path={relativeRoutes.onboarding.setupPassword.path}>
                        <Route index element={<SetupPassword />} />
                        <Route path={relativeRoutes.onboarding.setupPassword.createOrRestore.path}>
                            <Route index element={<CreateOrRestore />} />
                            <Route
                                path={relativeRoutes.onboarding.setupPassword.createOrRestore.selectNetwork.path}
                                element={<SelectNetwork />}
                            />
                            <Route
                                path={relativeRoutes.onboarding.setupPassword.createOrRestore.restoreWallet.path}
                                element={<RestoreWallet />}
                            />
                            <Route
                                path={relativeRoutes.onboarding.setupPassword.createOrRestore.generateSeedPhrase.path}
                            >
                                <Route index element={<GenerateSeedPhrase />} />
                                <Route
                                    path={
                                        relativeRoutes.onboarding.setupPassword.createOrRestore.generateSeedPhrase
                                            .confirmSeedPhrase.path
                                    }
                                >
                                    <Route index element={<ConfirmSeedPhrase />} />
                                    <Route
                                        path={
                                            relativeRoutes.onboarding.setupPassword.createOrRestore.generateSeedPhrase
                                                .confirmSeedPhrase.idIntro.path
                                        }
                                    >
                                        <Route index element={<IdCardsInfo />} />
                                        <Route
                                            path={
                                                relativeRoutes.onboarding.setupPassword.createOrRestore
                                                    .generateSeedPhrase.confirmSeedPhrase.idIntro.requestIdentity.path
                                            }
                                        >
                                            <Route index element={<IdIssuance />} />
                                        </Route>
                                    </Route>
                                </Route>
                            </Route>
                        </Route>
                    </Route>
                </Route>
                <Route element={<MainLayout />} path={relativeRoutes.home.path}>
                    <Route index element={<MainPage />} />
                    <Route path={relativeRoutes.home.sendFunds.path} element={<SendFunds />} />
                    <Route element={<ReceiveFunds />} path={relativeRoutes.home.receive.path} />
                    <Route element={<Onramp />} path={relativeRoutes.home.onramp.path} />
                    <Route path={relativeRoutes.home.transactionLog.path}>
                        <Route index element={<TransactionLog />} />
                        <Route
                            element={<TransactionDetails />}
                            path={relativeRoutes.home.transactionLog.details.path}
                        />
                    </Route>
                    <Route path={relativeRoutes.home.token.path}>
                        <Route element={<TokenDetailsCcd />} path={`${relativeRoutes.home.token.ccd.path}`} />
                        <Route element={<TokenDetailsPlt />} path={`${relativeRoutes.home.token.plt.path}`} />
                        <Route path={relativeRoutes.home.token.details.path}>
                            <Route index element={<TokenDetails />} />
                            <Route element={<TokenRaw />} path={`${relativeRoutes.home.token.details.raw.path}`} />
                        </Route>
                    </Route>
                    <Route
                        element={<SubmittedTransaction />}
                        path={`${relativeRoutes.home.submittedTransaction.path}`}
                    />
                    <Route path={relativeRoutes.home.manageTokenList.path}>
                        <Route index element={<ManageTokenList />} />
                        <Route path={relativeRoutes.home.manageTokenList.addToken.path}>
                            <Route index element={<AddToken />} />
                        </Route>
                    </Route>
                </Route>
                <Route element={<MainLayout />} path={relativeRoutes.settings.path}>
                    <Route path={relativeRoutes.settings.identities.path}>
                        <Route index element={<IdCards />} />
                        <Route path={relativeRoutes.settings.identities.create.path}>
                            <Route element={<IdIssuance />} index />
                            <Route
                                element={<IdIssuanceExternalFlow />}
                                path={relativeRoutes.settings.identities.create.externalFlow.path}
                            />
                            <Route
                                element={<IdIssuanceSubmitted />}
                                path={relativeRoutes.settings.identities.create.submitted.path}
                            />
                            <Route
                                element={<IdIssuanceFailed />}
                                path={relativeRoutes.settings.identities.create.failed.path}
                            />
                        </Route>
                    </Route>
                    <Route path={relativeRoutes.settings.accounts.path}>
                        <Route index element={<Accounts />} />
                        <Route
                            element={<ConnectedSites />}
                            path={relativeRoutes.settings.accounts.connectedSites.path}
                        />
                        <Route element={<PrivateKey />} path={relativeRoutes.settings.accounts.privateKey.path} />
                    </Route>
                    <Route path={relativeRoutes.settings.createAccount.path}>
                        <Route index element={<CreateAccount />} />
                        <Route
                            path={relativeRoutes.settings.createAccount.confirm.path}
                            element={<CreateAccountConfirm />}
                        />
                    </Route>
                    <Route element={<SeedPhrase />} path={relativeRoutes.settings.seedPhrase.path} />
                    <Route element={<ChangePasscode />} path={relativeRoutes.settings.passcode.path} />
                    <Route path={relativeRoutes.settings.web3Id.path}>
                        <Route index element={<Web3IdCredentials />} />
                        <Route element={<Web3IdImport />} path={relativeRoutes.settings.web3Id.import.path} />
                        <Route element={<Web3IdDetails />} path={relativeRoutes.settings.web3Id.details.path} />
                    </Route>
                    <Route path={relativeRoutes.settings.network.path}>
                        <Route index element={<NetworkSettings />} />
                        <Route element={<ConnectNetwork />} path={relativeRoutes.settings.network.connect.path} />
                        <Route element={<CustomConnectNetwork />} path={relativeRoutes.settings.network.custom.path} />
                    </Route>
                    <Route path={relativeRoutes.settings.restore.path}>
                        <Route index element={<RestoreIntro />} />
                        <Route path={relativeRoutes.settings.restore.main.path} element={<RestoreMain />} />
                    </Route>
                    <Route element={<About />} path={relativeRoutes.settings.about.path} />
                    <Route path={relativeRoutes.settings.nft.path}>
                        <Route index element={<Nft />} />
                        <Route path={relativeRoutes.settings.nft.details.path}>
                            <Route index element={<NftDetails />} />
                            <Route element={<NftRaw />} path={relativeRoutes.settings.nft.details.raw.path} />
                        </Route>
                    </Route>
                    <Route path={relativeRoutes.settings.earn.path}>
                        <Route index element={<EarningRewards />} />
                        <Route path={relativeRoutes.settings.earn.validator.path}>
                            <Route index element={<ValidatorStatus />} />
                            <Route path={`${relativeRoutes.settings.earn.validator.register.path}`}>
                                <Route index element={<ValidatorIntro />} />
                                <Route
                                    path={`${relativeRoutes.settings.earn.validator.register.configure.path}/*`}
                                    element={<RegisterValidatorTransactionFlow />}
                                />
                            </Route>
                            <Route path={relativeRoutes.settings.earn.validator.update.path}>
                                <Route index element={<UpdateValidator />} />
                                <Route
                                    path={`${relativeRoutes.settings.earn.validator.update.stake.path}/*`}
                                    element={<UpdateValidatorStakeTransactionFlow />}
                                />
                                <Route
                                    path={`${relativeRoutes.settings.earn.validator.update.settings.path}/*`}
                                    element={<UpdateValidatorPoolSettingsTransactionFlow />}
                                />
                                <Route
                                    path={`${relativeRoutes.settings.earn.validator.update.keys.path}/*`}
                                    element={<UpdateValidatorKeysTransactionFlow />}
                                />
                            </Route>
                            <Route
                                element={<SelfSuspend />}
                                path={relativeRoutes.settings.earn.validator.selfSuspend.path}
                            />
                            <Route
                                element={<ValidationResult />}
                                path={relativeRoutes.settings.earn.delegator.submit.path}
                            />
                        </Route>
                        <Route path={relativeRoutes.settings.earn.delegator.path}>
                            <Route index element={<DelegatorStatus />} />
                            <Route path={`${relativeRoutes.settings.earn.delegator.register.path}`}>
                                <Route index element={<DelegatorIntro />} />
                                <Route
                                    path={`${relativeRoutes.settings.earn.delegator.register.configure.path}/*`}
                                    element={<RegisterDelegatorTransactionFlow />}
                                />
                            </Route>
                            <Route
                                element={<UpdateDelegatorTransactionFlow />}
                                path={`${relativeRoutes.settings.earn.delegator.update.path}/*`}
                            />
                            <Route
                                element={<DelegationResult />}
                                path={relativeRoutes.settings.earn.delegator.submit.path}
                            />
                        </Route>
                    </Route>
                </Route>
                <Route element={<ExternalRequestLayout />} path={relativeRoutes.prompt.path}>
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
                            <ConnectAccount
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
                        path={relativeRoutes.prompt.addTokens.path}
                        element={
                            <AddTokens
                                respond={(response) => handleAddTokensResponse({ success: true, result: response })}
                            />
                        }
                    />
                    <Route
                        path={relativeRoutes.prompt.signMessage.path}
                        element={
                            <SignMessage
                                onSubmit={(signature) =>
                                    handleSignMessageResponse({ success: true, result: signature })
                                }
                                onReject={() =>
                                    handleSignMessageResponse({ success: false, message: 'Signing was rejected' })
                                }
                            />
                        }
                    />
                    <Route
                        path={relativeRoutes.prompt.signCIS3Message.path}
                        element={
                            <SignCis3Message
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
                    <Route path={relativeRoutes.prompt.recovery.path} element={<RestoreResult />} />
                    <Route path={relativeRoutes.prompt.endIdentityIssuance.path} element={<EndIdentityIssuance />} />
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
                        path={relativeRoutes.prompt.idProof.path}
                        element={
                            <IdProofRequest
                                onSubmit={(proof) => handleIdProofResponse({ success: true, result: proof })}
                                onReject={(reason) =>
                                    handleIdProofResponse({
                                        success: false,
                                        message: `Proof generation was rejected${reason ? `: ${reason}` : ''}`,
                                    })
                                }
                            />
                        }
                    />
                    <Route
                        path={relativeRoutes.prompt.web3IdProof.path}
                        element={
                            <VerifiablePresentationRequest
                                onSubmit={(presentationString) =>
                                    handleWeb3IdProofResponse({ success: true, result: presentationString })
                                }
                                onReject={(reason) =>
                                    handleWeb3IdProofResponse({
                                        success: false,
                                        message: `Proof generation was rejected${reason ? `: ${reason}` : ''}`,
                                    })
                                }
                            />
                        }
                    />
                    <Route
                        path={relativeRoutes.prompt.ageProof.path}
                        element={
                            <VerifiablePresentationRequest
                                onSubmit={(presentationString) =>
                                    handleAgeProofResponse({ success: true, result: presentationString })
                                }
                                onReject={(reason) =>
                                    handleAgeProofResponse({
                                        success: false,
                                        message: `Proof generation was rejected${reason ? `: ${reason}` : ''}`,
                                    })
                                }
                            />
                        }
                    />
                </Route>
            </Route>
        </ReactRoutes>
    );
}
