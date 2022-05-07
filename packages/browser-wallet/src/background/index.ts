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

/**
 * Callback method which installs Injected script into Main world of Dapp
 * @param payload
 * @param cb - Callback function if response is needed - its not
 * @param metadata
 */
async function onInitMessage(payload: any, cb: (pl: any) => void, metadata?: chrome.runtime.MessageSender) {
    logger.log('Init message received in new eventHandler');

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
}

const subscription = backgroundHandler.subscribe(MessageTypeEnum.Init, onInitMessage);
logger.log(`Subscription received from BackgroundHandler.subscribe: ${JSON.stringify(subscription)}`);

/** ******* To Zeppelin: Example of how to instantiate an instance of WalletMessageHandler for popup script***** */
async function onSendTransactionMessage(payload: any, cb: (pl: any) => void, metadata?: chrome.runtime.MessageSender) {
    cb({ data: 'SendTransaction response' });
    // To trigger this eventhandler from the browser
    // window.concordium.sendTransaction().then((m)=>{console.log(JSON.stringify(m))});
}

const popupHandler: IWalletMessageHandler = new WalletMessageHandler(HandlerTypeEnum.PopupScript);
const popupHandlerSubscription = popupHandler.subscribe(MessageTypeEnum.SendTransaction, onSendTransactionMessage);

// publish event every 10 second
// To listen for the event in the browser:
// window.concordium.on("event",(e)=>{console.log(JSON.stringify(e))})
setInterval(async () => {
    await popupHandler.publishEvent(HandlerTypeEnum.InjectedScript, { event: 'This is the event data' });
}, 10000);
