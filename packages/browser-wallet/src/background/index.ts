/* eslint-disable no-console */
import { BackgroundMessageHandler } from '@concordium/browser-wallet-message-hub/src/message-handlers/background-messagehandler';
import { getCurrentTab } from '@concordium/browser-wallet-message-hub/src/shared/utils/extensionHelpers';
import { logger } from '@concordium/browser-wallet-message-hub/src/message-handlers/logger';
import { PopupMessageHandler } from '@concordium/browser-wallet-message-hub/src/message-handlers/popup-messagehandler';
import { HandlerTypeEnum, Message, MessageTypeEnum } from '@concordium/browser-wallet-message-hub';

console.log('Background loaded');

// Create BackgroundHandler which injects script into Dapp when asked.
const backgroundHandler: BackgroundMessageHandler = new BackgroundMessageHandler();

// Only "init" message will get published
backgroundHandler.on('message', async () => {
    const tab: chrome.tabs.Tab = await getCurrentTab();

    if (tab?.id === undefined) {
        throw new Error('No current Tab was found with a valid id.');
    }

    logger.log('Injecting InjectScript into dApp Context Main world');
    await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        // TODO this is a reference to the output file, expecting to be placed in the root with manifest.json.
        // Would be nice if the relative output path could be built from a reference to the entrypoint file instead.
        files: ['inject.js'],
        world: 'MAIN',
    });
});

// *********** To Mr. Nazi-reviewer Der Zeppeliner :-) **********************'

// This section is pure for demonstrating how events flow from Wallet to Dapp
const popupHandler = new PopupMessageHandler();

// Responding on sendTransaction message with correct correlationId
// To send a transaction from the dapp do the following in the browser:
// window.concordium.sendTransaction().then(console.log("We got a response"));
popupHandler.on('message', async (m) => {
    const response: Message = new Message(
        HandlerTypeEnum.PopupScript,
        HandlerTypeEnum.InjectedScript,
        MessageTypeEnum.SendTransaction,
        { data: 'sendTransaction' }
    );
    response.correlationId = m.correlationId;

    await popupHandler.publishMessage(response);
});

// Raising events (AccountsChanged) to the current active window.
setInterval(async () => {
    const message: Message = new Message(
        HandlerTypeEnum.PopupScript,
        HandlerTypeEnum.InjectedScript,
        MessageTypeEnum.Event,
        { payload: 'The data' }
    );
    await popupHandler.publishMessage(message);

    // For printing out message in the browser console
    // window.concordium.on("event", (m)=>{console.log(JSON.stringify(m))});
}, 10000);
