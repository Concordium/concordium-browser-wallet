import { height, width } from '@popup/constants/dimensions';
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-console */
import { getCurrentTab } from '@concordium/browser-wallet-message-hub/src/shared/utils/extensionHelpers';
import { logger } from '@concordium/browser-wallet-message-hub/src/message-handlers/logger';
import { HandlerTypeEnum, MessageTypeEnum } from '@concordium/browser-wallet-message-hub';
import {
    IWalletMessageHandler,
    WalletMessageHandler,
} from '@concordium/browser-wallet-message-hub/src/message-handlers/wallet-messagehandler';

console.log('Background loaded');

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

    console.log('Injecting InjectScript into dApp Context Main world');
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        // TODO this is a reference to the output file, expecting to be placed in the root with manifest.json.
        // Would be nice if the relative output path could be built from a reference to the entrypoint file instead.
        files: ['inject.js'],
        world: 'MAIN',
    });
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const spawnPopup = async (payload: any) => {
    backgroundHandler.once(MessageTypeEnum.PopupReady, () =>
        backgroundHandler.publishEvent(HandlerTypeEnum.PopupScript, payload)
    );

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

const subscription = backgroundHandler.subscribe(MessageTypeEnum.Init, init);
logger.log(`Subscription received from BackgroundHandler.subscribe: ${JSON.stringify(subscription)}`);

backgroundHandler.subscribe(MessageTypeEnum.SendTransaction, spawnPopup);
