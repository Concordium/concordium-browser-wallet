/* eslint-disable no-console */
import { height, width } from '@popup/constants/dimensions';
import { getCurrentTab } from '@concordium/browser-wallet-message-hub/src/shared/utils/extensionHelpers';
import { Message, MessageType } from '@concordium/browser-wallet-message-hub';

console.log('BG');

let isLoaded = false;
/**
 * Callback method which installs Injected script into Main world of Dapp
 */
const init = async () => {
    if (isLoaded) {
        return;
    }

    isLoaded = true;

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
};

const spawnPopup = async (message: Message) => {
    chrome.runtime.onMessage.addListener((msg: Message, _sender, respond) => {
        if (msg?.type === MessageType.PopupReady) {
            respond(message);
        }
    });

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
};

chrome.runtime.onMessage.addListener((msg: Message) => {
    console.log('bg msg', msg);
    if (msg?.type === MessageType.Init) {
        init();
    }
    if (msg?.type === MessageType.PopupReady) {
        console.log('popup ready event');
    }
    if (msg?.type === MessageType.SendTransaction) {
        spawnPopup(msg);
    }
});
