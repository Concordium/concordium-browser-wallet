import { ExtensionMessageHandler, InternalMessageType } from '@concordium/browser-wallet-message-hub';

import { height, width } from '@popup/constants/dimensions';
import { spawnedPopupUrl } from '@shared/constants/url';
// eslint-disable-next-line import/no-cycle
import { onMessage } from './event-handling';
// eslint-disable-next-line import/no-cycle
import bgMessageHandler from './message-handler';

/**
 * Spawns a new popup on screen. Returning promise resolves when it receives a ready event from the popup
 */
export const spawnPopup = async (): Promise<chrome.windows.Window> => {
    const lastFocused = await chrome.windows.getLastFocused();
    // Position window in top right corner of lastFocused window.
    const top = lastFocused.top ?? 0;
    const left = (lastFocused.left ?? 0) + ((lastFocused.width ?? 0) - width);

    const window = chrome.windows.create({
        url: spawnedPopupUrl,
        type: 'popup',
        width,
        height,
        top,
        left,
    });

    // As the react app needs a chance to bootstrap, we need to wait for the ready signal.
    await onMessage(InternalMessageType.PopupReady);

    return window;
};

/**
 * Checks if a popup id open and available.
 */
const testPopupOpen = () => bgMessageHandler.sendInternalMessage(InternalMessageType.TestPopupOpen).catch(() => false);

let popupId: number | undefined;

/**
 * Try focusing an existing popup window.
 */
const focusExisting = async () => {
    try {
        await chrome.windows.update(popupId as number, { focused: true });
    } catch {
        // no popup was found. It's safe to assume the popup with id: "popupId" has been closed.
        popupId = undefined;
    }
};

/**
 * Ensures the handler is executed when a popup window is on screen.
 */
export const ensureAvailableWindow =
    (handler: ExtensionMessageHandler): ExtensionMessageHandler =>
    (...args) => {
        (async () => {
            const isOpen = await testPopupOpen();

            if (!isOpen) {
                const { id } = await spawnPopup();
                popupId = id;
            } else {
                focusExisting();
            }

            handler(...args);
        })();

        return true;
    };
