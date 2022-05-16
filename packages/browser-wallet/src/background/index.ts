import {
    createEventTypeFilter,
    EventType,
    ExtensionMessageHandler,
    MessageType,
} from '@concordium/browser-wallet-message-hub';
import { storedUrlWhitelist } from '@shared/storage/access';

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

bgMessageHandler.handleMessage(createEventTypeFilter(EventType.Init), injectScript);

const runIfWhitelisted: RunCondition<false> = async (_msg, sender) => {
    const whitelist = (await storedUrlWhitelist.get()) ?? [];

    if (sender.url !== undefined && whitelist.includes(sender.url)) {
        return { run: true };
    }

    return { run: false, response: false };
};

const runIfNotWhitelisted: RunCondition<boolean> = async (_msg, sender) => {
    const whitelist = (await storedUrlWhitelist.get()) ?? [];

    if (sender.url !== undefined && whitelist.includes(sender.url)) {
        return { run: false, response: true };
    }

    return { run: true };
};

const handleConnectMessage: HandleMessage<{ url: string | undefined; title: string | undefined }> = (
    _,
    { url, tab }
) => ({ url, title: tab?.title });

const handleConnectionResponse: HandleResponse<boolean> = async (response: boolean, _msg, sender) => {
    if (!sender.url) {
        return response;
    }

    const whitelist = (await storedUrlWhitelist.get()) ?? [];
    storedUrlWhitelist.set([...whitelist, sender.url]);

    return response;
};

handlePopupRequest(
    MessageType.Connect,
    EventType.Connect,
    runIfNotWhitelisted,
    handleConnectMessage,
    handleConnectionResponse
);
handlePopupRequest(MessageType.SendTransaction, EventType.SendTransaction, runIfWhitelisted);
handlePopupRequest(MessageType.SignMessage, EventType.SignMessage, runIfWhitelisted);
