import {
    createMessageTypeFilter,
    ExtensionMessageHandler,
    InternalMessageType,
    MessageStatusWrapper,
    MessageType,
} from '@concordium/browser-wallet-message-hub';
import { deserializeTypeValue, HttpProvider } from '@concordium/web-sdk';
import {
    getGenesisHash,
    sessionOpenPrompt,
    sessionPasscode,
    storedAcceptedTerms,
    storedAllowlist,
    storedCurrentNetwork,
    storedSelectedAccount,
} from '@shared/storage/access';

import { mainnet, stagenet, testnet } from '@shared/constants/networkConfiguration';
import { ChromeStorageKey, NetworkConfiguration } from '@shared/storage/types';
import { getTermsAndConditionsConfig } from '@shared/utils/network-helpers';
import { parsePayload } from '@shared/utils/payload-helpers';
import { BackgroundSendTransactionPayload } from '@shared/utils/types';
import { buildURLwithSearchParameters } from '@shared/utils/url-helpers';
import { Buffer } from 'buffer/';
import JSONBig from 'json-bigint';
import { startMonitoringPendingStatus } from './confirmation';
import { sendCredentialHandler } from './credential-deployment';
import { createIdProofHandler, runIfValidProof } from './id-proof';
import { addIdpListeners, identityIssuanceHandler } from './identity-issuance';
import bgMessageHandler from './message-handler';
import { setupRecoveryHandler, startRecovery } from './recovery';
import {
    forwardToPopup,
    HandleMessage,
    HandleResponse,
    RunCondition,
    runConditionComposer,
    setPopupSize,
    testPopupOpen,
} from './window-management';
import {
    runIfValidWeb3IdCredentialRequest,
    web3IdAddCredentialFinishHandler,
    createWeb3IdProofHandler,
    runIfValidWeb3IdProof,
} from './web3Id';

const rpcCallNotAllowedMessage = 'RPC Call can only be performed by whitelisted sites';
const walletLockedMessage = 'The wallet is locked';
async function isWalletLocked(): Promise<boolean> {
    const passcode = await sessionPasscode.get();
    return !passcode;
}

/**
 * Determines whether the given URL has been allowlisted.
 */
async function isAllowlisted(url: string): Promise<boolean> {
    const urlOrigin = new URL(url).origin;
    const allowlist = await storedAllowlist.get();
    if (allowlist) {
        return Object.keys(allowlist).includes(urlOrigin);
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

    const isWhiteListed = await isAllowlisted(senderUrl);
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
        onFailure(rpcCallNotAllowedMessage);
    }
}

/**
 * Returns the url/port of the current node's gRPC endpoint, if the caller is allowed to perform gRPC calls.
 */
async function exportGRPCLocation(
    callerUrl: string,
    onSuccess: (response: string | undefined) => void,
    onFailure: (response: string) => void
): Promise<void> {
    const isWhiteListed = await isAllowlisted(callerUrl);
    if (!isWhiteListed) {
        return onFailure(rpcCallNotAllowedMessage);
    }
    const network = await storedCurrentNetwork.get();
    if (!network || !network.grpcUrl || !network.grpcPort) {
        return onFailure('No gRPC URL available');
    }
    return onSuccess(`${network.grpcUrl}:${network.grpcPort}`);
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

// TODO: This is a temporary hacky way to do migration. When more involved migration is required
// we should implement a proper migration framework so that migration only runs once.
async function migrateNetwork(network: NetworkConfiguration) {
    if (network.genesisHash && (!network.grpcUrl || !network.grpcPort || !network.ccdScanUrl)) {
        switch (network.genesisHash) {
            case mainnet.genesisHash:
                await storedCurrentNetwork.set(mainnet);
                break;
            case testnet.genesisHash:
                await storedCurrentNetwork.set(testnet);
                break;
            case stagenet.genesisHash:
                await storedCurrentNetwork.set(stagenet);
                break;
            default:
                break;
        }
    }
}

const startupHandler = async () => {
    const network = await storedCurrentNetwork.get();
    if (network) {
        await migrateNetwork(network);
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
        const onSuccess = (result: string | undefined) => respond({ success: true, result });
        performRpcCall(input.payload.method, input.payload.params, sender.url, onSuccess, onFailure);
    } else {
        onFailure('Missing sender URL');
    }
    return true;
});

bgMessageHandler.handleMessage(createMessageTypeFilter(MessageType.GrpcRequest), (_input, sender, respond) => {
    const onFailure = (error: string) => respond({ success: false, error });
    const onSuccess = (result: string | undefined) => respond({ success: true, result });
    if (!sender.url) {
        return onFailure('Missing sender URL');
    }
    exportGRPCLocation(sender.url, onSuccess, onFailure);
    return true;
});

bgMessageHandler.handleMessage(createMessageTypeFilter(InternalMessageType.CreateIdProof), createIdProofHandler);

bgMessageHandler.handleMessage(
    createMessageTypeFilter(InternalMessageType.CreateWeb3IdProof),
    createWeb3IdProofHandler
);

const NOT_WHITELISTED = 'Site is not whitelisted';

/**
 * Run condition that ensures that a handler is only run if the URL is in the allowlist
 * of the provided account.
 */
const runIfAccountIsAllowlisted: RunCondition<MessageStatusWrapper<undefined>> = async (msg, sender) => {
    const { accountAddress } = msg.payload;
    const allowlist = await storedAllowlist.get();
    const locked = await isWalletLocked();

    if (!accountAddress || allowlist === undefined || locked) {
        return { run: false, response: { success: false, message: NOT_WHITELISTED } };
    }

    if (sender.url !== undefined) {
        const allowlistedAccounts = allowlist[new URL(sender.url).origin];
        if (allowlistedAccounts.includes(accountAddress)) {
            return { run: true };
        }
    }

    return { run: false, response: { success: false, message: NOT_WHITELISTED } };
};

const INCORRECT_SIGN_MESSAGE_FORMAT = 'The given message does not have correct format.';
const UNABLE_TO_PARSE_SIGN_MESSAGE_OBJECT =
    'The given message data could not be deserialized using the provided schema';

/**
 * Run condition for signMessage, which ensures the message is either a string,
 * or a messageObject and in that case that the schema can be used to deserialize the message data.
 */
const ensureMessageWithSchemaParse: RunCondition<MessageStatusWrapper<undefined>> = async (msg) => {
    const { message } = msg.payload;
    if (typeof message === 'string') {
        return { run: true };
    }

    if (!message.schema || !message.data) {
        return { run: false, response: { success: false, message: INCORRECT_SIGN_MESSAGE_FORMAT } };
    }
    try {
        deserializeTypeValue(Buffer.from(message.data, 'hex'), Buffer.from(message.schema, 'base64'));
        return { run: true };
    } catch {
        return { run: false, response: { success: false, message: UNABLE_TO_PARSE_SIGN_MESSAGE_OBJECT } };
    }
};

/**
 * Run condition for sendTransaction, which ensures that the transaction can be parsed (including that parameters can be serialized).
 */
const ensureTransactionPayloadParse: RunCondition<MessageStatusWrapper<undefined>> = async (msg) => {
    const payload = msg.payload as BackgroundSendTransactionPayload;

    try {
        parsePayload(payload.type, payload.payload, payload.parameters, payload.schema, payload.schemaVersion);
    } catch (e) {
        return { run: false, response: { success: false, message: `The given transaction is not valid due to: ${e}` } };
    }
    return { run: true };
};

// TODO change this to find most recently selected account
/**
 * Finds the most prioritized account that is connected to the provided site.
 * The priority is defined as:
 * 1. If the selected account is connected, then that is returned.
 * 1. The first account other than the selected account that is connected to the site. The order here
 * is defined by the order of the entries in the stored allowlist entry.
 * @param url the site to find an account that is connected to
 * @returns the highest priority account address that is connected to the site with the provided URL.
 */
async function findPrioritizedAccountConnectedToSite(url: string): Promise<string | undefined> {
    const urlOrigin = new URL(url).origin;
    const selectedAccount = await storedSelectedAccount.get();
    const allowlist = await storedAllowlist.get();

    if (!selectedAccount || !allowlist) {
        return undefined;
    }

    const connectedAccounts = allowlist[urlOrigin] ?? [];
    if (connectedAccounts.includes(selectedAccount)) {
        return selectedAccount;
    }

    if (connectedAccounts.length > 0) {
        return connectedAccounts[0];
    }

    return undefined;
}

/**
 * Run condition that runs the handler if the service URL is not currently allowlisted.
 *
 * 1. If the wallet is locked, then do run.
 * 1. If no allowlist exists in storage, then do run.
 * 1. If the service URL is already in the allowlist, then do not run and return the list of account addresses.
 * 1. Else run the handler.
 */
const runIfNotAllowlisted: RunCondition<MessageStatusWrapper<string[] | undefined>> = async (_msg, sender) => {
    if (!sender.url) {
        throw new Error('Expected URL to be available for sender.');
    }

    const locked = await isWalletLocked();
    if (locked) {
        return { run: true };
    }

    const allowlist = await storedAllowlist.get();
    if (!allowlist) {
        return { run: true };
    }

    const allowlistedAccounts = allowlist[new URL(sender.url).origin];
    if (allowlistedAccounts !== undefined) {
        return { run: false, response: { success: true, result: allowlistedAccounts } };
    }

    // The URL has not been allowlisted yet, so run the handler.
    return { run: true };
};

/**
 * Run condition that ensures that a handler is only run if the URL is in the allowlist.
 */
const runIfAllowlisted: RunCondition<MessageStatusWrapper<undefined>> = async (_msg, sender) => {
    const allowlist = await storedAllowlist.get();
    const locked = await isWalletLocked();

    if (allowlist === undefined || locked) {
        return { run: false, response: { success: false, message: NOT_WHITELISTED } };
    }

    if (sender.url !== undefined && allowlist[new URL(sender.url).origin]) {
        return { run: true };
    }

    return { run: false, response: { success: false, message: NOT_WHITELISTED } };
};

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

const getSelectedChainHandler: ExtensionMessageHandler = (_msg, sender, respond) => {
    isWalletLocked().then((locked) => {
        if (locked) {
            respond(undefined);
        } else {
            if (!sender.url) {
                throw new Error('Expected URL to be available for sender.');
            }

            getGenesisHash()
                .then(respond)
                .catch(() => respond(undefined));
        }
    });
    return true;
};

bgMessageHandler.handleMessage(createMessageTypeFilter(MessageType.GetSelectedChain), getSelectedChainHandler);

bgMessageHandler.handleMessage(
    createMessageTypeFilter(MessageType.AddWeb3IdCredentialFinish),
    (input, sender, respond) => {
        if (!sender.url || !isAllowlisted(sender.url)) {
            respond({ success: false, message: 'not allowlisted' });
        }

        web3IdAddCredentialFinishHandler(input.payload)
            .then(() => respond({ success: true }))
            .catch((error) => respond({ success: false, message: error.message }));

        return true;
    }
);

function withPromptStart<T>(): RunCondition<MessageStatusWrapper<T | undefined>> {
    return async () => {
        const isPromptOpen = await sessionOpenPrompt.get();
        const isOpen = await testPopupOpen();
        if (isPromptOpen && isOpen) {
            return { run: false, response: { success: false, message: 'Another prompt is already open' } };
        }
        sessionOpenPrompt.set(true);
        return { run: true };
    };
}

function withPromptEnd() {
    sessionOpenPrompt.set(false);
}

forwardToPopup(
    MessageType.Connect,
    InternalMessageType.Connect,
    runConditionComposer(runIfNotWhitelisted, withPromptStart()),
    handleConnectMessage,
    handleConnectionResponse,
    withPromptEnd
);
forwardToPopup(
    MessageType.ConnectAccounts,
    InternalMessageType.ConnectAccounts,
    runConditionComposer(runIfNotAllowlisted, withPromptStart()),
    handleConnectMessage,
    undefined,
    withPromptEnd
);
forwardToPopup(
    MessageType.SendTransaction,
    InternalMessageType.SendTransaction,
    runConditionComposer(runIfAccountIsAllowlisted, ensureTransactionPayloadParse, withPromptStart()),
    appendUrlToPayload,
    undefined,
    withPromptEnd
);
forwardToPopup(
    MessageType.SignMessage,
    InternalMessageType.SignMessage,
    runConditionComposer(runIfAccountIsAllowlisted, ensureMessageWithSchemaParse, withPromptStart()),
    appendUrlToPayload,
    undefined,
    withPromptEnd
);
forwardToPopup(
    MessageType.AddTokens,
    InternalMessageType.AddTokens,
    runConditionComposer(runIfAccountIsAllowlisted, withPromptStart()),
    appendUrlToPayload,
    undefined,
    withPromptEnd
);
forwardToPopup(
    MessageType.IdProof,
    InternalMessageType.IdProof,
    runConditionComposer(runIfAccountIsAllowlisted, runIfValidProof, withPromptStart()),
    appendUrlToPayload,
    undefined,
    withPromptEnd
);
forwardToPopup(
    MessageType.AddWeb3IdCredential,
    InternalMessageType.AddWeb3IdCredential,
    runConditionComposer(runIfAllowlisted, runIfValidWeb3IdCredentialRequest, withPromptStart()),
    appendUrlToPayload,
    undefined,
    withPromptEnd
);

forwardToPopup(
    MessageType.Web3IdProof,
    InternalMessageType.Web3IdProof,
    runConditionComposer(runIfAllowlisted, runIfValidWeb3IdProof, withPromptStart()),
    appendUrlToPayload,
    undefined,
    withPromptEnd
);
