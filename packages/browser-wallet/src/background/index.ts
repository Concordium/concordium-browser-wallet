/* eslint-disable no-console */
import { BackgroundMessageHandler } from '@concordium/browser-wallet-message-hub/src/message-handlers/background-messagehandler';
import { getCurrentTab } from '@concordium/browser-wallet-message-hub/src/shared/utils/extensionHelpers';
import { logger } from '@concordium/browser-wallet-message-hub/src/message-handlers/logger';
import { PopupMessageHandler } from '@concordium/browser-wallet-message-hub/src/message-handlers/popup-messagehandler';
import { HandlerTypeEnum, Message, MessageTypeEnum } from '@concordium/browser-wallet-message-hub';

console.log('Background loaded');

const popup: PopupMessageHandler = new PopupMessageHandler();

// Create BackgroundHandler which injects script into Dapp when asked.
const backgroundHandler: BackgroundMessageHandler = new BackgroundMessageHandler();

// Only "init" message will get published
backgroundHandler.on('message', async () => {
    const tab: chrome.tabs.Tab = await getCurrentTab();

    if (tab?.id === undefined) {
        throw new Error('No current Tab was found with a valid id.');
    }

    logger.log('Injecting InjectScript into dApp Contextt Main world');
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        // TODO this is a reference to the output file, expecting to be placed in the root with manifest.json.
        // Would be nice if the relative output path could be built from a reference to the entrypoint file instead.
        files: ['inject.js'],
        world: 'MAIN',
    });
});

setInterval(async () => {
    const message: Message = new Message(
        HandlerTypeEnum.PopupScript,
        HandlerTypeEnum.InjectedScript,
        MessageTypeEnum.Event,
        {}
    );
    await popup.publishMessage(message);
    console.log(`::popUpHandler ${message}`);
}, 5000);
