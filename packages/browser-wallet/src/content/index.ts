import { HandlerTypeEnum, Message, MessageTypeEnum } from '@concordium/browser-wallet-message-hub';
import { ContentMessageHandler } from '@concordium/browser-wallet-message-hub/src/message-handlers/content-messagehandler';

// Create ContentMessageHandler and initialize ports and add event handlers
const contentMessageHandler: ContentMessageHandler = new ContentMessageHandler();

// Listen forward all PostMessage sent from Dapp
contentMessageHandler.addWindowPostMessageEventListener();

// Create a runtime port for communication with runtime port message listeners (Background and popup)
contentMessageHandler.createPortAndSetupEventListeners();

// Tell Wallet (BackgroundScript) to inject script into dApp Context
contentMessageHandler.publishMessage(
    new Message(HandlerTypeEnum.ContentScript, HandlerTypeEnum.BackgroundScript, MessageTypeEnum.init, {})
);
