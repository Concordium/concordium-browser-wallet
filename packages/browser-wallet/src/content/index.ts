import { HandlerTypeEnum, Message, MessageTypeEnum } from '@concordium/browser-wallet-message-hub';
import { ContentMessageHandler } from '@concordium/browser-wallet-message-hub/src/message-handlers/content-messagehandler';
import { logger } from '@concordium/browser-wallet-message-hub/src/message-handlers/logger';

logger.log('Content loaded');
// Create ContentMessageHandler and initialize ports and add event handlers
const contentMessageHandler: ContentMessageHandler = new ContentMessageHandler();

// Tell Wallet (BackgroundScript) to inject script into dApp Context
contentMessageHandler.publishMessage(
    new Message(HandlerTypeEnum.ContentScript, HandlerTypeEnum.BackgroundScript, MessageTypeEnum.Init, {})
);
