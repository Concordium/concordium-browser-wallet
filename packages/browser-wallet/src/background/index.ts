import { height, width } from '@popup/constants/dimensions';
import {
    createEventTypeFilter,
    createMessageTypeFilter,
    EventType,
    ExtensionMessageHandler,
    MessageType,
} from '@concordium/browser-wallet-message-hub';
import { bgMessageHandler } from './message-handler';

/**
 * Callback method which installs Injected script into Main world of Dapp
 */
const init: ExtensionMessageHandler = (_msg, sender) => {
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

const spawnPopup = async (): Promise<chrome.windows.Window> => {
    const lastFocused = await chrome.windows.getLastFocused();
    // Position window in top right corner of lastFocused window.
    const top = lastFocused.top ?? 0;
    const left = (lastFocused.left ?? 0) + ((lastFocused.width ?? 0) - width);

    return chrome.windows.create({
        url: 'popup.html',
        type: 'popup',
        width,
        height,
        top,
        left,
    });
};

const spawnPopupAndExecute = (
    handler: ExtensionMessageHandler,
    ...args: Parameters<ExtensionMessageHandler>
): Promise<chrome.windows.Window> => {
    bgMessageHandler.handleOnce(createEventTypeFilter(EventType.PopupReady), () => {
        handler(...args);

        return false;
    });

    return spawnPopup();
};

let popupId: number | undefined;
const getPopup = (): Promise<chrome.windows.Window | undefined> =>
    chrome.windows.getAll().then((ws) => ws.find((w) => w.id === popupId));

const ensureAvailableWindow = (handler: ExtensionMessageHandler): ExtensionMessageHandler => {
    return (...args) => {
        getPopup()
            .then((w) => {
                if (w !== undefined) {
                    handler(...args);
                    return w;
                }

                return spawnPopupAndExecute(handler, ...args);
            })
            .then((w) => {
                popupId = w.id;
            });

        return true;
    };
};

bgMessageHandler.handleMessage(createEventTypeFilter(EventType.Init), init);
bgMessageHandler.handleMessage(
    createMessageTypeFilter(MessageType.Connect),
    ensureAvailableWindow((_msg, sender, respond) => {
        bgMessageHandler.sendInternalEvent(EventType.Connect, { url: sender.url, title: sender.tab?.title }, respond);
        return true;
    })
);
bgMessageHandler.handleMessage(
    createMessageTypeFilter(MessageType.SendTransaction),
    ensureAvailableWindow((msg, _sender, respond) => {
        bgMessageHandler.sendInternalEvent(EventType.SendTransaction, msg.payload, respond);
        return true;
    })
);
