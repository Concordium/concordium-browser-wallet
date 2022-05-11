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
 * Returns the current selected tab - if any.
 */
async function getCurrentTab(): Promise<chrome.tabs.Tab> {
    const queryOptions = { active: true, lastFocusedWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
    return tab;
}

let isLoaded = false;
/**
 * Callback method which installs Injected script into Main world of Dapp
 */
const init: ExtensionMessageHandler = () => {
    if (isLoaded) {
        return false;
    }

    isLoaded = true;

    (async () => {
        // Get the current tab of chrome and execute script in dApp context MAIN world
        const tab = await getCurrentTab();

        if (!tab.id) {
            throw new Error('No ID for tab.');
        }

        await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            // TODO this is a reference to the output file, expecting to be placed in the root with manifest.json.
            // Would be nice if the relative output path could be built from a reference to the entrypoint file instead.
            files: ['inject.js'],
            world: 'MAIN',
        });
    })();

    return false;
};

const spawnPopup: ExtensionMessageHandler = (message, _sender, respond) => {
    bgMessageHandler.handleOnce(createEventTypeFilter(EventType.PopupReady), () => {
        bgMessageHandler.sendInternalEvent(EventType.Connect, message.payload, respond);

        return false;
    });

    (async () => {
        const lastFocused = await chrome.windows.getLastFocused();
        // Position window in top right corner of lastFocused window.
        const top = lastFocused.top ?? 0;
        const left = (lastFocused.left ?? 0) + ((lastFocused.width ?? 0) - width);

        await chrome.windows.create({
            url: 'popup.html',
            type: 'popup',
            width,
            height,
            top,
            left,
        });
    })();

    return true;
};

bgMessageHandler.handleMessage(createEventTypeFilter(EventType.Init), init);
// TODO this currently assumes no windows are open, and opens a new window regardless.
bgMessageHandler.handleMessage(createMessageTypeFilter(MessageType.Connect), spawnPopup);
// TODO this currently assumes a popup is open. Need something that detects if a window is open, and opens one if none are.
bgMessageHandler.handleMessage(createMessageTypeFilter(MessageType.SendTransaction), (msg, _sender, respond) => {
    bgMessageHandler.sendInternalEvent(EventType.SendTransaction, msg.payload, respond);
    return true;
});
