import {
    createMessageTypeFilter,
    ExtensionMessageHandler,
    InternalMessageType,
    MessageType,
} from '@concordium/browser-wallet-message-hub';
import { storedConnectedSites, storedSelectedAccount } from '@shared/storage/access';

import bgMessageHandler from './message-handler';
import { forwardToPopup, HandleMessage, HandleResponse, RunCondition, setPopupSize } from './window-management';

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

/**
 * Run condition which looks up URL in connected sites for the provided account. Runs handler if URL is included in connected sites.
 */
const runIfWhitelisted: RunCondition<false> = async (msg, sender) => {
    const { accountAddress } = msg.payload;
    const connectedSites = await storedConnectedSites.get();

    if (!accountAddress || connectedSites === undefined) {
        return { run: false, response: false };
    }

    const accountConnectedSites = connectedSites[accountAddress];
    if (sender.url !== undefined && accountConnectedSites && accountConnectedSites.includes(sender.url)) {
        return { run: true };
    }

    return { run: false, response: false };
};

/**
 * Run condition that runs the handler if the wallet is non-empty (an account exists), and no
 * account in the wallet is connected to the sender URL.
 *
 * 1. If no selected account exists (the wallet is empty), then do not run and return undefined.
 * 1. Else if the selected account is connected to the sender URL, then do not run and return the select account address.
 * 1. Else if any other account is connected to the sender URL, then do not run and return that account's address.
 * 1. Else run the handler.
 */
const runIfNotWhitelisted: RunCondition<string | undefined> = async (_msg, sender) => {
    if (!sender.url) {
        throw new Error('Expected URL to be available for sender.');
    }

    const selectedAccount = await storedSelectedAccount.get();
    const connectedSites = await storedConnectedSites.get();

    // No accounts in the wallet.
    if (selectedAccount === undefined) {
        return { run: false, response: undefined };
    }

    // Selected account is connected to the URL, so do not run but returns its address.
    const selectedAccountConnectedSites = connectedSites ? connectedSites[selectedAccount] : [];
    if (selectedAccountConnectedSites && selectedAccountConnectedSites.includes(sender.url)) {
        return { run: false, response: selectedAccount };
    }

    // Another account in the wallet is connected to the URL, so do not run but return that address.
    if (connectedSites) {
        const connectedAccount = Object.entries(connectedSites).find(
            (item) => sender.url && item[1].includes(sender.url)
        );
        if (connectedAccount) {
            return { run: false, response: connectedAccount[0] };
        }
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
        const selectedAccount = await storedSelectedAccount.get();
        const connectedSites = await storedConnectedSites.get();

        if (selectedAccount && connectedSites) {
            // Selected account is connected to the URL, so return its address
            const selectedAccountConnectedSites = connectedSites ? connectedSites[selectedAccount] : [];
            if (selectedAccountConnectedSites && selectedAccountConnectedSites.includes(sender.url)) {
                return selectedAccount;
            }

            // Another account in the wallet is connected to the URL, so do not run but return that address.
            if (connectedSites) {
                const connectedAccount = Object.entries(connectedSites).find(
                    (item) => sender.url && item[1] && item[1].includes(sender.url)
                );
                if (connectedAccount) {
                    return connectedAccount[0];
                }
            }

            return undefined;
        }
        return undefined;
    }

    return response;
};

forwardToPopup(
    MessageType.Connect,
    InternalMessageType.Connect,
    runIfNotWhitelisted,
    handleConnectMessage,
    handleConnectionResponse
);
forwardToPopup(MessageType.SendTransaction, InternalMessageType.SendTransaction, runIfWhitelisted);
forwardToPopup(MessageType.SignMessage, InternalMessageType.SignMessage, runIfWhitelisted);
