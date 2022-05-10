import { HandlerType, MessageType } from '@concordium/browser-wallet-message-hub';
import { ContentMessageHandler } from '@concordium/browser-wallet-message-hub/src/message-handlers/content-messagehandler';

// Create ContentMessageHandler and initialize ports and add event handlers
const contentMessageHandler: ContentMessageHandler = new ContentMessageHandler();

// Tell Wallet (BackgroundScript) to inject script into dApp Context
contentMessageHandler.publishMessage(HandlerType.BackgroundScript, MessageType.Init, undefined);
