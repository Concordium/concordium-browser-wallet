import {
    createEventTypeFilter,
    EventType,
    ExtensionMessageHandler,
    MessageType,
} from '@concordium/browser-wallet-message-hub';

import bgMessageHandler, { handlePopupRequest } from './message-handler';

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

handlePopupRequest(MessageType.Connect, EventType.Connect, (_, { url, tab }) => ({ url, title: tab?.title }));
handlePopupRequest(MessageType.SendTransaction, EventType.SendTransaction, ({ payload }) => payload);
handlePopupRequest(MessageType.SignMessage, EventType.SignMessage, ({ payload }) => payload);
