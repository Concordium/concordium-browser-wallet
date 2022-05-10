/* eslint-disable no-console */
import { height, width } from '@popup/constants/dimensions';
import { getCurrentTab } from '@concordium/browser-wallet-message-hub/src/shared/utils/extensionHelpers';
import {
    EventHandler,
    handleMessage,
    handleOnce,
    HandlerType,
    Message,
    MessageType,
} from '@concordium/browser-wallet-message-hub';

let isLoaded = false;
/**
 * Callback method which installs Injected script into Main world of Dapp
 */
const init: EventHandler = () => {
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

        console.log('injecting');

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

const spawnPopup: EventHandler = (message, _sender, respond) => {
    handleOnce(MessageType.PopupReady, () => {
        const nextM = new Message(HandlerType.PopupScript, MessageType.SignMessage, message.payload);

        chrome.runtime.sendMessage(nextM, respond);

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

handleMessage(MessageType.Init, init);
handleMessage(MessageType.SendTransaction, spawnPopup);
