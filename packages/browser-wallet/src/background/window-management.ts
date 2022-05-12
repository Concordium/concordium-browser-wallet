import { EventType, ExtensionMessageHandler } from '@concordium/browser-wallet-message-hub';

import { height, width } from '@popup/constants/dimensions';
// eslint-disable-next-line import/no-cycle
import { eventFired } from './event-handling';

/**
 * Spawns a new popup on screen. Returning promise resolves when it receives a ready event from the popup
 */
export const spawnPopup = async (): Promise<chrome.windows.Window> => {
    const lastFocused = await chrome.windows.getLastFocused();
    // Position window in top right corner of lastFocused window.
    const top = lastFocused.top ?? 0;
    const left = (lastFocused.left ?? 0) + ((lastFocused.width ?? 0) - width);

    const window = chrome.windows.create({
        url: 'popup.html',
        type: 'popup',
        width,
        height,
        top,
        left,
    });

    // As the react app needs a chance to bootstrap, we need to wait for the ready signal.
    await eventFired(EventType.PopupReady);

    return window;
};

let popupId: number | undefined;

/**
 * Attempts to get a popup window that has an ID matching the one stored.
 */
export const getPopup = (): Promise<chrome.windows.Window | undefined> =>
    chrome.windows.getAll().then((ws) => ws.find((w) => w.type === 'popup' && w.id === popupId));

/**
 * Ensures the handler is executed when a popup window is on screen.
 */
export const ensureAvailableWindow =
    (handler: ExtensionMessageHandler): ExtensionMessageHandler =>
    (...args) => {
        (async () => {
            const w = (await getPopup()) ?? (await spawnPopup());
            popupId = w.id;

            handler(...args);
        })();

        return true;
    };
