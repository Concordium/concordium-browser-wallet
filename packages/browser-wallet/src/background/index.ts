import {
    createMessageTypeFilter,
    ExtensionMessageHandler,
    InternalMessageType,
    MessageType,
} from '@concordium/browser-wallet-message-hub';
import { storedSelectedAccount, storedUrlWhitelist } from '@shared/storage/access';

import bgMessageHandler, { HandleMessage, handlePopupRequest, HandleResponse, RunCondition } from './message-handler';

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

/**
 * Run condition which looks up url in stored whitelist. Runs handler if url is included in whitelist.
 */
const runIfWhitelisted: RunCondition<false> = async (_msg, sender) => {
    const whitelist = (await storedUrlWhitelist.get()) ?? [];

    if (sender.url !== undefined && whitelist.includes(sender.url)) {
        return { run: true };
    }

    return { run: false, response: false };
};

/**
 * Run condition which looks up url in stored whitelist. Runs handler if url is NOT included in whitelist.
 */
const runIfNotWhitelisted: RunCondition<string | undefined> = async (_msg, sender) => {
    const whitelist = (await storedUrlWhitelist.get()) ?? [];

    if (!sender.url) {
        throw new Error('Expected url to be available for sender.');
    }

    if (whitelist.includes(sender.url)) {
        const selectedAccount = await storedSelectedAccount.get();
        return { run: false, response: selectedAccount };
    }

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
        const whitelist = (await storedUrlWhitelist.get()) ?? [];
        storedUrlWhitelist.set([...whitelist, sender.url]);

        return storedSelectedAccount.get();
    }

    return response;
};

handlePopupRequest(
    MessageType.Connect,
    InternalMessageType.Connect,
    runIfNotWhitelisted,
    handleConnectMessage,
    handleConnectionResponse
);
handlePopupRequest(MessageType.SendTransaction, InternalMessageType.SendTransaction, runIfWhitelisted);
handlePopupRequest(MessageType.SignMessage, InternalMessageType.SignMessage, runIfWhitelisted);
