import { height, width } from '@popup/constants/dimensions';
import { getCurrentTab } from '@concordium/browser-wallet-message-hub/src/shared/utils/extensionHelpers';
import { HandlerTypeEnum, MessageTypeEnum } from '@concordium/browser-wallet-message-hub';
import {
    IWalletMessageHandler,
    WalletMessageHandler,
} from '@concordium/browser-wallet-message-hub/src/message-handlers/wallet-messagehandler';
import { EventHandler } from '@concordium/browser-wallet-message-hub/src/message-handlers/types';

// Create BackgroundHandler which injects script into Dapp when asked.
const backgroundHandler: IWalletMessageHandler = new WalletMessageHandler(HandlerTypeEnum.BackgroundScript);

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

    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        // TODO this is a reference to the output file, expecting to be placed in the root with manifest.json.
        // Would be nice if the relative output path could be built from a reference to the entrypoint file instead.
        files: ['inject.js'],
        world: 'MAIN',
    });
};

const spawnPopup: EventHandler = async (message) => {
    backgroundHandler.handleOnce(MessageTypeEnum.PopupReady, () => backgroundHandler.publishMessage(message));

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

backgroundHandler.subscribe(MessageTypeEnum.Init, init);
backgroundHandler.subscribe(MessageTypeEnum.SendTransaction, spawnPopup);
