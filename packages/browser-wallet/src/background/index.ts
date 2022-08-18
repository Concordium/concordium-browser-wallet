import {
    createMessageTypeFilter,
    ExtensionMessageHandler,
    InternalMessageType,
    MessageType,
} from '@concordium/browser-wallet-message-hub';
import { HttpProvider } from '@concordium/web-sdk';
import { storedConnectedSites, storedSelectedAccount, storedJsonRpcUrl } from '@shared/storage/access';

import JSONBig from 'json-bigint';
import bgMessageHandler from './message-handler';
import { forwardToPopup, HandleMessage, HandleResponse, RunCondition, setPopupSize } from './window-management';

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
    respond: (response: string | undefined) => void
) {
    const isWhiteListed = await isWhiteListedForAnyAccount(senderUrl);
    if (isWhiteListed) {
        const url = await storedJsonRpcUrl.get();
        if (!url) {
            throw new Error('No Json RPC URL available');
        }
        const provider = new HttpProvider(url, fetch);
        provider
            .request(
                // We lose the method's typing when sending the message.
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                method as any,
                params && JSONBig.parse(params)
            )
            .then(respond)
            .catch(() => respond(undefined));
    } else {
        respond(undefined);
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

bgMessageHandler.handleMessage(createMessageTypeFilter(InternalMessageType.Init), injectScript);
bgMessageHandler.handleMessage(createMessageTypeFilter(InternalMessageType.SetViewSize), ({ payload }) => {
    setPopupSize(payload);
});

bgMessageHandler.handleMessage(createMessageTypeFilter(MessageType.JsonRpcRequest), (input, sender, respond) => {
    if (sender.url) {
        performRpcCall(input.payload.method, input.payload.params, sender.url, respond);
    } else {
        respond(undefined);
    }
    return true;
});

/**
 * Run condition which looks up URL in connected sites for the provided account. Runs handler if URL is included in connected sites.
 */
const runIfWhitelisted: RunCondition<false> = async (msg, sender) => {
    const { accountAddress } = msg.payload;
    const connectedSites = await storedConnectedSites.get();

    if (!accountAddress || connectedSites === undefined) {
        return { run: false, response: false };
    }

    const accountConnectedSites = connectedSites[accountAddress] ?? [];
    if (sender.url !== undefined && accountConnectedSites.includes(new URL(sender.url).origin)) {
        return { run: true };
    }

    return { run: false, response: false };
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
 * 1. If no selected account exists (the wallet is empty), then do not run and return undefined.
 * 1. Else if the selected account is connected to the sender URL, then do not run and return the selected account address.
 * 1. Else if any other account is connected to the sender URL, then do not run and return that account's address.
 * 1. Else run the handler.
 */
const runIfNotWhitelisted: RunCondition<string | undefined> = async (_msg, sender) => {
    if (!sender.url) {
        throw new Error('Expected URL to be available for sender.');
    }

    const selectedAccount = await storedSelectedAccount.get();

    // No accounts in the wallet.
    if (selectedAccount === undefined) {
        return { run: false, response: undefined };
    }

    const accountConnectedToSite = await findPrioritizedAccountConnectedToSite(sender.url);
    if (accountConnectedToSite) {
        return { run: false, response: accountConnectedToSite };
    }

    // No account in the wallet is connected to the URL, so run the handler.
    return { run: true };
};

const handleConnectMessage: HandleMessage<{ url: string | undefined; title: string | undefined }> = (
    _,
    { url, tab }
) => ({ url, title: tab?.title });

const handleConnectionResponse: HandleResponse<string | undefined | false> = async (
    response: boolean,
    _msg,
    sender
) => {
    if (!sender.url) {
        throw new Error('Expected url to be available for sender.');
    }

    if (response !== false) {
        return findPrioritizedAccountConnectedToSite(sender.url);
    }

    return response;
};

/**
 * Callback method which returns the prioritized account's address.
 */
const getMostRecentlySelectedAccountHandler: ExtensionMessageHandler = (_msg, sender, respond) => {
    if (!sender.url) {
        throw new Error('Expected URL to be available for sender.');
    }
    findPrioritizedAccountConnectedToSite(sender.url).then(respond);
    return true;
};

bgMessageHandler.handleMessage(
    createMessageTypeFilter(MessageType.GetSelectedAccount),
    getMostRecentlySelectedAccountHandler
);

forwardToPopup(
    MessageType.Connect,
    InternalMessageType.Connect,
    runIfNotWhitelisted,
    handleConnectMessage,
    handleConnectionResponse
);
forwardToPopup(MessageType.SendTransaction, InternalMessageType.SendTransaction, runIfWhitelisted);
forwardToPopup(MessageType.SignMessage, InternalMessageType.SignMessage, runIfWhitelisted);
