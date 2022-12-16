import {
    createMessageTypeFilter,
    InternalMessageType,
    MessageType,
    ExtensionMessageHandler,
    MessageStatusWrapper,
} from '@concordium/browser-wallet-message-hub';
import { HttpProvider } from '@concordium/web-sdk';
import {
    storedConnectedSites,
    storedSelectedAccount,
    storedCurrentNetwork,
    sessionPasscode,
    sessionOpenPrompt,
    storedAcceptedTerms,
} from '@shared/storage/access';

import JSONBig from 'json-bigint';
import { ChromeStorageKey, NetworkConfiguration } from '@shared/storage/types';
import { buildURLwithSearchParameters } from '@shared/utils/url-helpers';
import { getTermsAndConditionsConfig } from '@shared/utils/network-helpers';
import bgMessageHandler from './message-handler';
import {
    forwardToPopup,
    HandleMessage,
    HandleResponse,
    RunCondition,
    runConditionComposer,
    setPopupSize,
    testPopupOpen,
} from './window-management';
import { addIdpListeners, identityIssuanceHandler } from './identity-issuance';
import { startMonitoringPendingStatus } from './confirmation';
import { sendCredentialHandler } from './credential-deployment';
import { startRecovery, setupRecoveryHandler } from './recovery';
import { createIdProofHandler, runIfValidProof } from './id-proof';

const walletLockedMessage = 'The wallet is locked';
async function isWalletLocked(): Promise<boolean> {
    const passcode = await sessionPasscode.get();
    return !passcode;
}

/**
 * Determines whether the given url has been whitelisted by any account.
 */
async function isWhiteListedForAnyAccount(url: string): Promise<boolean> {
    const urlOrigin = new URL(url).origin;
    const connectedSites = await storedConnectedSites.get();
    if (connectedSites) {
        return Object.values(connectedSites).some((sites) => sites.includes(urlOrigin));
    }
    return false;
}

async function performRpcCall(
    method: string,
    params: string | undefined,
    senderUrl: string,
    onSuccess: (response: string | undefined) => void,
    onFailure: (response: string) => void
) {
    const locked = await isWalletLocked();
    if (locked) {
        onFailure(walletLockedMessage);
    }

    const isWhiteListed = await isWhiteListedForAnyAccount(senderUrl);
    if (isWhiteListed) {
        const url = (await storedCurrentNetwork.get())?.jsonRpcUrl;
        if (!url) {
            onFailure('No JSON-RPC URL available');
        } else {
            const provider = new HttpProvider(url, fetch);
            provider
                .request(
                    // We lose the method's typing when sending the message.
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    method as any,
                    params && JSONBig.parse(params)
                )
                .then(onSuccess)
                .catch((e) => onFailure(e.toString()));
        }
    } else {
        onFailure('RPC Call can only be performed by whitelisted sites');
    }
}

/**
 * Callback method which installs Injected script into Main world of Dapp
 */
const injectScript: ExtensionMessageHandler = (_msg, sender, respond) => {
    if (sender.tab?.id === undefined) {
        throw new Error('No ID for tab.');
    }

    chrome.scripting
        .executeScript({
            target: { tabId: sender.tab.id },
            // TODO this is a reference to the output file, expecting to be placed in the root with manifest.json.
            // Would be nice if the relative output path could be built from a reference to the entrypoint file instead.
            files: ['inject.js'],
            world: 'MAIN',
        })
        .then(() => respond(true))
        .catch(() => respond(false));

    return true;
};

async function reportVersion(network?: NetworkConfiguration) {
    const baseUrl = 'https://concordium.matomo.cloud/matomo.php';
    const params = {
        idsite: '3',
        rec: '1',
        action_name: 'app-startup',
        dimension1: chrome.runtime.getManifest().version,
        dimension2: network?.name ?? 'none',
    };
    await fetch(buildURLwithSearchParameters(baseUrl, params));
    // TODO: log if this fails
}

async function checkForNewTermsAndConditions() {
    const current = await storedAcceptedTerms.get();
    try {
        const config = await getTermsAndConditionsConfig();
        if (config?.version && (!current || current.version !== config.version)) {
            storedAcceptedTerms.set({ accepted: false, version: config.version });
        }
    } catch {
        // TODO: log this
    }
}

const startupHandler = async () => {
    const network = await storedCurrentNetwork.get();
    if (network) {
        await startMonitoringPendingStatus(network);
    }
    checkForNewTermsAndConditions();

    reportVersion(network);
};

const networkChangeHandler = (network: NetworkConfiguration) => startMonitoringPendingStatus(network);

chrome.storage.local.onChanged.addListener((changes) => {
    if (ChromeStorageKey.NetworkConfiguration in changes) {
        networkChangeHandler(changes[ChromeStorageKey.NetworkConfiguration].newValue);
    }
});

chrome.storage.session.onChanged.addListener((changes) => {
    if (ChromeStorageKey.IsRecovering in changes) {
        if (changes[ChromeStorageKey.IsRecovering].newValue) {
            startRecovery();
        }
    }
});

setupRecoveryHandler();
chrome.runtime.onStartup.addListener(startupHandler);
chrome.runtime.onInstalled.addListener(startupHandler);
bgMessageHandler.handleMessage(createMessageTypeFilter(InternalMessageType.PopupReady), () => {
    startupHandler();
});

addIdpListeners();

bgMessageHandler.handleMessage(
    createMessageTypeFilter(InternalMessageType.SendCredentialDeployment),
    sendCredentialHandler
);

bgMessageHandler.handleMessage(
    createMessageTypeFilter(InternalMessageType.StartIdentityIssuance),
    identityIssuanceHandler
);
bgMessageHandler.handleMessage(createMessageTypeFilter(InternalMessageType.Init), injectScript);
bgMessageHandler.handleMessage(createMessageTypeFilter(InternalMessageType.SetViewSize), ({ payload }) => {
    setPopupSize(payload);
});

bgMessageHandler.handleMessage(createMessageTypeFilter(MessageType.JsonRpcRequest), (input, sender, respond) => {
    const onFailure = (error: string) => respond({ success: false, error });
    if (sender.url) {
        const onSuccess = (response: string | undefined) => respond({ success: true, response });
        performRpcCall(input.payload.method, input.payload.params, sender.url, onSuccess, onFailure);
    } else {
        onFailure('Missing sender URL');
    }
    return true;
});

bgMessageHandler.handleMessage(createMessageTypeFilter(InternalMessageType.CreateIdProof), createIdProofHandler);

const NOT_WHITELISTED = 'Site is not whitelisted';

/**
 * Run condition which looks up URL in connected sites for the provided account. Runs handler if URL is included in connected sites.
 */
const runIfWhitelisted: RunCondition<MessageStatusWrapper<undefined>> = async (msg, sender) => {
    const { accountAddress } = msg.payload;
    const connectedSites = await storedConnectedSites.get();
    const locked = await isWalletLocked();

    if (!accountAddress || connectedSites === undefined || locked) {
        return { run: false, response: { success: false, message: NOT_WHITELISTED } };
    }

    const accountConnectedSites = connectedSites[accountAddress] ?? [];
    if (sender.url !== undefined && accountConnectedSites.includes(new URL(sender.url).origin)) {
        return { run: true };
    }

    return { run: false, response: { success: false, message: NOT_WHITELISTED } };
};

// TODO change this to find most recently selected account
/**
 * Finds the most prioritized account that is connected to the provided site.
 * The priority is defined as:
 * 1. If the selected account is connected, then that is returned.
 * 1. The first account other than the selected account that is connected to the site. The order here
 * is defined by the order of the entries of the stored connected sites.
 * @param url the site to find an account that is connected to
 * @returns the highest priority account address that is connected to the site with the provided URL.
 */
async function findPrioritizedAccountConnectedToSite(url: string): Promise<string | undefined> {
    const urlOrigin = new URL(url).origin;
    const selectedAccount = await storedSelectedAccount.get();
    const connectedSites = await storedConnectedSites.get();

    if (!selectedAccount || !connectedSites) {
        return undefined;
    }

    const selectedAccountConnectedSites = connectedSites[selectedAccount] ?? [];
    if (selectedAccountConnectedSites.includes(urlOrigin)) {
        return selectedAccount;
    }

    const connectedAccount = Object.entries(connectedSites).find((item) => item[1] && item[1].includes(urlOrigin));
    if (connectedAccount) {
        return connectedAccount[0];
    }

    return undefined;
}

/**
 * Run condition that runs the handler if the wallet is non-empty (an account exists), and no
 * account in the wallet is connected to the sender URL.
 *
 * 1. If the wallet is locked, then do run.
 * 1. If no selected account exists (the wallet is empty), then do not run and return undefined.
 * 1. Else if the selected account is connected to the sender URL, then do not run and return the selected account address.
 * 1. Else if any other account is connected to the sender URL, then do not run and return that account's address.
 * 1. Else run the handler.
 */
const runIfNotWhitelisted: RunCondition<MessageStatusWrapper<string | undefined>> = async (_msg, sender) => {
    if (!sender.url) {
        throw new Error('Expected URL to be available for sender.');
    }

    const selectedAccount = await storedSelectedAccount.get();

    // No accounts in the wallet.
    if (selectedAccount === undefined) {
        return { run: false, response: { success: false, message: 'No account in the wallet' } };
    }

    const locked = await isWalletLocked();
    if (locked) {
        return { run: true };
    }

    const accountConnectedToSite = await findPrioritizedAccountConnectedToSite(sender.url);
    if (accountConnectedToSite) {
        return { run: false, response: { success: true, result: accountConnectedToSite } };
    }

    // No account in the wallet is connected to the URL, so run the handler.
    return { run: true };
};

const handleConnectMessage: HandleMessage<{ url: string | undefined; title: string | undefined }> = (
    _,
    { url, tab }
) => ({ url, title: tab?.title });

const appendUrlToPayload: HandleMessage<{ url: string | undefined; title: string | undefined }> = (msg, { url }) => ({
    ...msg.payload,
    url,
});

const handleConnectionResponse: HandleResponse<MessageStatusWrapper<string | undefined>> = async (
    response: boolean,
    _msg,
    sender
) => {
    if (!sender.url) {
        throw new Error('Expected url to be available for sender.');
    }

    if (response !== false) {
        return { success: true, result: await findPrioritizedAccountConnectedToSite(sender.url) };
    }

    return { success: false, message: 'Connection rejected' };
};

/**
 * Callback method which returns the prioritized account's address.
 */
const getMostRecentlySelectedAccountHandler: ExtensionMessageHandler = (_msg, sender, respond) => {
    isWalletLocked().then((locked) => {
        if (locked) {
            respond(undefined);
        } else {
            if (!sender.url) {
                throw new Error('Expected URL to be available for sender.');
            }
            findPrioritizedAccountConnectedToSite(sender.url).then(respond);
        }
    });
    return true;
};

bgMessageHandler.handleMessage(
    createMessageTypeFilter(MessageType.GetSelectedAccount),
    getMostRecentlySelectedAccountHandler
);

const withPromptStart: RunCondition<MessageStatusWrapper<string | undefined>> = async () => {
    const isPromptOpen = await sessionOpenPrompt.get();
    const isOpen = await testPopupOpen();
    if (isPromptOpen && isOpen) {
        return { run: false, response: { success: false, message: 'Another prompt is already open' } };
    }
    sessionOpenPrompt.set(true);
    return { run: true };
};

function withPromptEnd() {
    sessionOpenPrompt.set(false);
}

forwardToPopup(
    MessageType.Connect,
    InternalMessageType.Connect,
    runConditionComposer(runIfNotWhitelisted, withPromptStart),
    handleConnectMessage,
    handleConnectionResponse,
    withPromptEnd
);
forwardToPopup(
    MessageType.SendTransaction,
    InternalMessageType.SendTransaction,
    runConditionComposer(runIfWhitelisted, withPromptStart),
    appendUrlToPayload,
    undefined,
    withPromptEnd
);
forwardToPopup(
    MessageType.SignMessage,
    InternalMessageType.SignMessage,
    runConditionComposer(runIfWhitelisted, withPromptStart),
    appendUrlToPayload,
    undefined,
    withPromptEnd
);
forwardToPopup(
    MessageType.AddTokens,
    InternalMessageType.AddTokens,
    runConditionComposer(runIfWhitelisted, withPromptStart),
    appendUrlToPayload,
    undefined,
    withPromptEnd
);
forwardToPopup(
    MessageType.IdProof,
    InternalMessageType.IdProof,
    runConditionComposer(runIfWhitelisted, runIfValidProof, withPromptStart),
    appendUrlToPayload,
    undefined,
    withPromptEnd
);
