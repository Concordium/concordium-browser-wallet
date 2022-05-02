/* eslint-disable no-console */
import { BackgroundMessageHandler } from '@concordium/browser-wallet-message-hub/src/message-handlers/background-messagehandler';
import { PopupMessageHandler } from '@concordium/browser-wallet-message-hub/src/message-handlers/popup-messagehandler';
import { HandlerTypeEnum, Message, MessageTypeEnum } from '@concordium/browser-wallet-message-hub';

console.log('Background loaded');

// Create BackgroundHandler which injects script into Dapp when asked.
const backgroundHandler: BackgroundMessageHandler = new BackgroundMessageHandler();

const popUpHandler: PopupMessageHandler = new PopupMessageHandler();

// Listen for all runtime port messages for the current selected tab
backgroundHandler.addRuntimePortListenersForCurrentTab();
popUpHandler.addRuntimePortListenersForCurrentTab();

// Publish event
setInterval(() => {
    const eventMessage: Message = new Message(
        HandlerTypeEnum.popupScript,
        HandlerTypeEnum.injectedScript,
        MessageTypeEnum.event,
        { Event: 'The event' }
    );
    popUpHandler.publishMessage(eventMessage);
}, 10000);

// To force ESModule. Can safely be removed when any imports are added.
export {};
