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
const injectScript: ExtensionMessageHandler = (_msg, sender) => {
    if (sender.tab?.id === undefined) {
        throw new Error('No ID for tab.');
    }

    chrome.scripting.executeScript({
        target: { tabId: sender.tab.id },
        // TODO this is a reference to the output file, expecting to be placed in the root with manifest.json.
        // Would be nice if the relative output path could be built from a reference to the entrypoint file instead.
        files: ['inject.js'],
        world: 'MAIN',
    });

    return false;
};

bgMessageHandler.handleMessage(createEventTypeFilter(EventType.Init), injectScript);

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

const handleConnectCondition: RunCondition<boolean> = async (_msg, sender) => {
    const whitelist = (await storedUrlWhitelist.get()) ?? [];

    const isWhitelisted = whitelist.some((url) => sender.url === url);

    if (isWhitelisted) {
        return { run: false, response: true };
    }
    return { run: true };
};
handlePopupRequest(
    MessageType.Connect,
    EventType.Connect,
    handleConnectMessage,
    handleConnectionResponse,
    handleConnectCondition
);

handlePopupRequest(MessageType.SendTransaction, EventType.SendTransaction);
handlePopupRequest(MessageType.SignMessage, EventType.SignMessage);
