import React from 'react';
import { Route, Routes as ReactRoutes } from 'react-router-dom';
import { relativeRoutes } from '@popup/popupX/constants/routes';
import MainLayout from '@popup/popupX/page-layouts/MainLayout';
import MainPage from '@popup/popupX/pages/MainPage';
import { SendConfirm, SendFunds, SendSuccess } from '@popup/popupX/pages/SendFunds';
import ReceiveFunds from '@popup/popupX/pages/ReceiveFunds';
import TransactionLog from '@popup/popupX/pages/TransactionLog';
import TransactionDetails from '@popup/popupX/pages/TransactionDetails';
import TokenDetails from '@popup/popupX/pages/TokenDetails';
import IdCards from '@popup/popupX/pages/IdCards';
import Accounts from '@popup/popupX/pages/Accounts';
import RecoveryPhrase from '@popup/popupX/pages/RecoveryPhrase';
import Web3Id from '@popup/popupX/pages/Web3Id';
import NetworkSettings from '@popup/popupX/pages/NetworkSettings';
import ConnectNetwork from '@popup/popupX/pages/ConnectNetwork';
import { IdSubmitted, IdCardsInfo, RequestIdentity, SetupPassword, Welcome } from '@popup/popupX/pages/Onboarding';
import ConnectedSites from '@popup/popupX/pages/ConnectedSites';
import EarningRewards from '@popup/popupX/pages/EarningRewards';
import { BakerIntro } from '@popup/popupX/pages/EarningRewards/Baker/Intro';
import { DelegatorIntro } from '@popup/popupX/pages/EarningRewards/Delegator/Intro';
import { RegisterBaker } from '@popup/popupX/pages/EarningRewards/Baker/Register';
import { OpenPool } from '@popup/popupX/pages/EarningRewards/Baker/OpenPool';
import { BakerKeys } from '@popup/popupX/pages/EarningRewards/Baker/BakerKeys';
import DelegationType from '@popup/popupX/pages/EarningRewards/Delegator/Type/DelegationType';
import RegisterDelegator from '../pages/EarningRewards/Delegator/Register/RegisterDelegator';
import DelegationResult from '../pages/EarningRewards/Delegator/Result/DelegationResult';

export default function Routes() {
    return (
        <ReactRoutes>
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
                        <Route element={<SendSuccess />} path={relativeRoutes.home.send.confirmation.confirmed.path} />
                    </Route>
                </Route>
                <Route element={<ReceiveFunds />} path={relativeRoutes.home.receive.path} />
                <Route path={relativeRoutes.home.transactionLog.path}>
                    <Route index element={<TransactionLog />} />
                    <Route element={<TransactionDetails />} path={relativeRoutes.home.transactionLog.details.path} />
                </Route>
                <Route element={<TokenDetails />} path={relativeRoutes.home.token.path} />
                <Route path={relativeRoutes.settings.path}>
                    <Route element={<IdCards />} path={relativeRoutes.settings.idCards.path} />
                    <Route path={relativeRoutes.settings.accounts.path}>
                        <Route index element={<Accounts />} />
                        <Route
                            element={<ConnectedSites />}
                            path={relativeRoutes.settings.accounts.connectedSites.path}
                        />
                    </Route>
                    <Route element={<RecoveryPhrase />} path={relativeRoutes.settings.seedPhrase.path} />
                    <Route element={<Web3Id />} path={relativeRoutes.settings.web3Id.path} />
                    <Route path={relativeRoutes.settings.network.path}>
                        <Route index element={<NetworkSettings />} />
                        <Route element={<ConnectNetwork />} path={relativeRoutes.settings.network.connect.path} />
                    </Route>
                    <Route path={relativeRoutes.settings.earn.path}>
                        <Route index element={<EarningRewards />} />
                        <Route path={relativeRoutes.settings.earn.baker.path}>
                            <Route element={<BakerIntro />} path={relativeRoutes.settings.earn.baker.intro.path} />
                            <Route
                                element={<RegisterBaker />}
                                path={relativeRoutes.settings.earn.baker.register.path}
                            />
                            <Route element={<OpenPool />} path={relativeRoutes.settings.earn.baker.openPool.path} />
                            <Route element={<BakerKeys />} path={relativeRoutes.settings.earn.baker.bakerKeys.path} />
                        </Route>
                        <Route path={relativeRoutes.settings.earn.delegator.path}>
                            <Route
                                element={<DelegatorIntro />}
                                path={relativeRoutes.settings.earn.delegator.intro.path}
                            />
                            <Route
                                element={<DelegationType />}
                                path={relativeRoutes.settings.earn.delegator.type.path}
                            />
                            <Route
                                element={<RegisterDelegator />}
                                path={relativeRoutes.settings.earn.delegator.register.path}
                            />
                            <Route
                                element={<DelegationResult />}
                                path={relativeRoutes.settings.earn.delegator.result.path}
                            />
                        </Route>
                    </Route>
                </Route>
            </Route>
        </ReactRoutes>
    );
}
