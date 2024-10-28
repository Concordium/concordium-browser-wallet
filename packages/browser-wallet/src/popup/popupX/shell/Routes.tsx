import React from 'react';
import { Route, Routes as ReactRoutes } from 'react-router-dom';
import { relativeRoutes, routePrefix } from '@popup/popupX/constants/routes';
import MainLayout from '@popup/popupX/page-layouts/MainLayout';
import MainPage from '@popup/popupX/pages/MainPage';
import { SendConfirm, SendFunds } from '@popup/popupX/pages/SendFunds';
import ReceiveFunds from '@popup/popupX/pages/ReceiveFunds';
import TransactionLog from '@popup/popupX/pages/TransactionLog';
import TransactionDetails from '@popup/popupX/pages/TransactionDetails';
import { TokenDetails, TokenDetailsCcd } from '@popup/popupX/pages/TokenDetails';
import IdCards from '@popup/popupX/pages/IdCards';
import Accounts from '@popup/popupX/pages/Accounts';
import SeedPhrase from 'src/popup/popupX/pages/SeedPhrase';
import ChangePasscode from 'src/popup/popupX/pages/ChangePasscode';
import { Web3IdCredentials, Web3IdImport } from '@popup/popupX/pages/Web3Id';
import NetworkSettings from '@popup/popupX/pages/NetworkSettings';
import ConnectNetwork from '@popup/popupX/pages/ConnectNetwork';
import About from '@popup/popupX/pages/About';
import { IdSubmitted, IdCardsInfo, RequestIdentity, SetupPassword, Welcome } from '@popup/popupX/pages/Onboarding';
import ConnectedSites from '@popup/popupX/pages/ConnectedSites';
import EarningRewards from '@popup/popupX/pages/EarningRewards';
import { BakerIntro } from '@popup/popupX/pages/EarningRewards/Baker/Intro';
import { RegisterBaker } from '@popup/popupX/pages/EarningRewards/Baker/Register';
import { OpenPool } from '@popup/popupX/pages/EarningRewards/Baker/OpenPool';
import { BakerKeys } from '@popup/popupX/pages/EarningRewards/Baker/BakerKeys';
import PrivateKey from '@popup/popupX/pages/PrivateKey';
import { RestoreIntro, RestoreResult } from '@popup/popupX/pages/Restore';
import { MessagePromptHandlersType } from '@popup/shared/utils/message-prompt-handlers';
import ConnectionRequest from '@popup/popupX/pages/prompts/ConnectionRequest';
import ExternalRequestLayout from '@popup/popupX/page-layouts/ExternalRequestLayout';
import { ManageTokenList, AddToken } from '@popup/popupX/pages/ManageTokens';
import { DelegationResult } from '../pages/EarningRewards/Delegator/Result';
import SubmittedTransaction from '../pages/SubmittedTransaction';
import { DelegatorIntro } from '../pages/EarningRewards/Delegator/Intro';
import DelegatorTransactionFlow, { UpdateDelegatorTransactionFlow } from '../pages/EarningRewards/Delegator/TransactionFlow';
import DelegatorStatus from '../pages/EarningRewards/Delegator/Status';

export default function Routes({ messagePromptHandlers }: { messagePromptHandlers: MessagePromptHandlersType }) {
    const { handleConnectionResponse } = messagePromptHandlers;
    return (
        <ReactRoutes>
            <Route path={routePrefix}>
                <Route element={<MainLayout />} path={relativeRoutes.onboarding.path}>
                    <Route index element={<Welcome />} />
                    <Route element={<SetupPassword />} path={relativeRoutes.onboarding.setupPassword.path} />
                    <Route element={<IdCardsInfo />} path={relativeRoutes.onboarding.idIntro.path} />
                    <Route element={<RequestIdentity />} path={relativeRoutes.onboarding.requestIdentity.path} />
                    <Route element={<IdSubmitted />} path={relativeRoutes.onboarding.idSubmitted.path} />
                </Route>
                <Route element={<MainLayout />} path={relativeRoutes.home.path}>
                    <Route index element={<MainPage />} />
                    <Route path={relativeRoutes.home.send.path}>
                        <Route index element={<SendFunds />} />
                        <Route path={relativeRoutes.home.send.confirmation.path}>
                            <Route index element={<SendConfirm />} />
                        </Route>
                    </Route>
                    <Route element={<ReceiveFunds />} path={relativeRoutes.home.receive.path} />
                    <Route path={relativeRoutes.home.transactionLog.path}>
                        <Route index element={<TransactionLog />} />
                        <Route
                            element={<TransactionDetails />}
                            path={relativeRoutes.home.transactionLog.details.path}
                        />
                    </Route>
                    <Route element={<TokenDetails />} path={relativeRoutes.home.token.path} />
                    <Route element={<TokenDetailsCcd />} path={`${relativeRoutes.home.token.path}/ccd`} />
                    <Route
                        element={<SubmittedTransaction />}
                        path={`${relativeRoutes.home.submittedTransaction.path}`}
                    />
                    <Route path={relativeRoutes.home.manageTokenList.path}>
                        <Route index element={<ManageTokenList />} />
                        <Route element={<AddToken />} path={relativeRoutes.home.manageTokenList.addToken.path} />
                    </Route>
                </Route>
                <Route element={<MainLayout />} path={relativeRoutes.settings.path}>
                    <Route element={<IdCards />} path={relativeRoutes.settings.idCards.path} />
                    <Route path={relativeRoutes.settings.accounts.path}>
                        <Route index element={<Accounts />} />
                        <Route
                            element={<ConnectedSites />}
                            path={relativeRoutes.settings.accounts.connectedSites.path}
                        />
                        <Route element={<PrivateKey />} path={relativeRoutes.settings.accounts.privateKey.path} />
                    </Route>
                    <Route element={<SeedPhrase />} path={relativeRoutes.settings.seedPhrase.path} />
                    <Route element={<ChangePasscode />} path={relativeRoutes.settings.passcode.path} />
                    <Route path={relativeRoutes.settings.web3Id.path}>
                        <Route index element={<Web3IdCredentials />} />
                        <Route element={<Web3IdImport />} path={relativeRoutes.settings.web3Id.import.path} />
                    </Route>
                    <Route path={relativeRoutes.settings.network.path}>
                        <Route index element={<NetworkSettings />} />
                        <Route element={<ConnectNetwork />} path={relativeRoutes.settings.network.connect.path} />
                    </Route>
                    <Route path={relativeRoutes.settings.restore.path}>
                        <Route index element={<RestoreIntro />} />
                        <Route element={<RestoreResult />} path={relativeRoutes.settings.restore.result.path} />
                    </Route>
                    <Route element={<About />} path={relativeRoutes.settings.about.path} />
                    <Route path={relativeRoutes.settings.earn.path}>
                        <Route index element={<EarningRewards />} />
                        <Route path={relativeRoutes.settings.earn.validator.path}>
                            <Route element={<BakerIntro />} path={relativeRoutes.settings.earn.validator.intro.path} />
                            <Route
                                element={<RegisterBaker />}
                                path={relativeRoutes.settings.earn.validator.register.path}
                            />
                            <Route element={<OpenPool />} path={relativeRoutes.settings.earn.validator.openPool.path} />
                            <Route element={<BakerKeys />} path={relativeRoutes.settings.earn.validator.keys.path} />
                        </Route>
                        <Route path={relativeRoutes.settings.earn.delegator.path}>
                            <Route index element={<DelegatorStatus />} />
                            <Route path={`${relativeRoutes.settings.earn.delegator.register.path}`}>
                                <Route
                                    index
                                    element={
                                        <DelegatorIntro
                                            onDoneRoute={relativeRoutes.settings.earn.delegator.register.configure.path}
                                        />
                                    }
                                />
                                <Route
                                    path={`${relativeRoutes.settings.earn.delegator.register.configure.path}/*`}
                                    element={<DelegatorTransactionFlow />}
                                />
                            </Route>
                            <Route
                                element={<UpdateDelegatorTransactionFlow />}
                                path={`${relativeRoutes.settings.earn.delegator.update.path}/*`}
                            />
                            <Route element={<>TODO</>} path={`${relativeRoutes.settings.earn.delegator.stop.path}`} />
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
                </Route>
            </Route>
        </ReactRoutes>
    );
}
