import shared from '@popup/shared/i18n/en';
import mainLayout from '@popup/page-layouts/MainLayout/i18n/en';
import account from '@popup/pages/Account/i18n/en';
import setup from '@popup/pages/Setup/i18n/en';
import sendTransaction from '@popup/pages/SendTransaction/i18n/en';
import signMessage from '@popup/pages/SignMessage/i18n/en';
import signCIS3Message from '@popup/pages/SignCIS3Message/i18n/en';
import connectionRequest from '@popup/pages/ConnectionRequest/i18n/en';
import settings from '@popup/pages/Settings/i18n/en';
import networkSettings from '@popup/pages/NetworkSettings/i18n/en';
import recovery from '@popup/pages/Recovery/i18n/en';
import about from '@popup/pages/About/i18n/en';
import addAccount from '@popup/pages/AddAccount/i18n/en';
import identityIssuance from '@popup/pages/IdentityIssuance/i18n/en';
import identity from '@popup/pages/Identity/i18n/en';
import login from '@popup/pages/Login/i18n/en';
import transactionLog from '@popup/pages/Account/TransactionLog/i18n/en';
import changePasscode from '@popup/pages/ChangePasscode/i18n/en';
import externalAddTokens from '@popup/pages/ExternalAddTokens/i18n/en';
import termsAndConditions from '@popup/pages/TermsAndConditions/i18n/en';
import idProofRequest from '@popup/pages/IdProofRequest/i18n/en';
import allowlist from '@popup/pages/Allowlist/i18n/en';
import connectAccountsRequest from '@popup/pages/ConnectAccountsRequest/i18n/en';
import web3IdProofRequest from '@popup/pages/Web3ProofRequest/i18n/en';
import verifiableCredential from '@popup/pages/VerifiableCredential/i18n/en';
import addWeb3IdCredential from '@popup/pages/AddWeb3IdCredential/i18n/en';
import verifiableCredentialBackup from '@popup/pages/VerifiableCredentialBackup/i18n/en';
import ageProofRequest from '@popup/pages/AgeProofRequest/i18n/en';
import viewSeedPhrase from '@popup/pages/ViewSeedPhrase/i18n/en';

// Wallet-X locales
import onboarding from '@popup/popupX/pages/Onboarding/i18n/en';
import receiveFunds from '@popup/popupX/pages/ReceiveFunds/i18n/en';
import idCards from '@popup/popupX/pages/IdCards/i18n/en';
import accounts from '@popup/popupX/pages/Accounts/i18n/en';
import mainPage from '@popup/popupX/pages/MainPage/i18n/en';
import tokenDetails from '@popup/popupX/pages/TokenDetails/i18n/en';
import restore from '@popup/popupX/pages/Restore/i18n/en';
import connectedSites from '@popup/popupX/pages/ConnectedSites/i18n/en';
import privateKey from '@popup/popupX/pages/PrivateKey/i18n/en';
import seedPhrase from '@popup/popupX/pages/SeedPhrase/i18n/en';
import passcode from '@popup/popupX/pages/ChangePasscode/i18n/en';
import network from '@popup/popupX/pages/NetworkSettings/i18n/en';
import connect from '@popup/popupX/pages/ConnectNetwork/i18n/en';
import sharedX from '@popup/popupX/shared/i18n/en';
import aboutPage from '@popup/popupX/pages/About/i18n/en';
import header from '@popup/popupX/page-layouts/MainLayout/Header/i18n/en';
import web3Id from '@popup/popupX/pages/Web3Id/i18n/en';
import earn from '@popup/popupX/pages/EarningRewards/i18n/en';
import mangeTokens from '@popup/popupX/pages/ManageTokens/i18n/en';
import connectionRequestX from '@popup/popupX/pages/prompts/ConnectionRequest/i18n/en';
import submittedTransaction from '@popup/popupX/pages/SubmittedTransaction/i18n/en';

const t = {
    shared,
    mainLayout,
    account,
    setup,
    sendTransaction,
    signMessage,
    signCIS3Message,
    connectionRequest,
    settings,
    networkSettings,
    recovery,
    addAccount,
    identityIssuance,
    identity,
    about,
    login,
    transactionLog,
    changePasscode,
    externalAddTokens,
    termsAndConditions,
    idProofRequest,
    allowlist,
    connectAccountsRequest,
    addWeb3IdCredential,
    web3IdProofRequest,
    verifiableCredential,
    verifiableCredentialBackup,
    ageProofRequest,
    viewSeedPhrase,
    x: {
        onboarding,
        receiveFunds,
        idCards,
        accounts,
        mainPage,
        tokenDetails,
        restore,
        connectedSites,
        privateKey,
        seedPhrase,
        passcode,
        network,
        connect,
        sharedX,
        aboutPage,
        header,
        web3Id,
        earn,
        mangeTokens,
        prompts: { connectionRequestX },
        submittedTransaction,
    },
};

export default t;
