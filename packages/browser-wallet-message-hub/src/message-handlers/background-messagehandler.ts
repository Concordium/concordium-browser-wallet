import { HandlerTypeEnum } from './handlertype-enum';
import { Message } from './message';
import { logger } from './logger';
import { MessageTypeEnum } from './messagetype-enum';
import { AbstractWalletMessageHandler } from './abstract-wallet-messagehandler';

export class BackgroundMessageHandler extends AbstractWalletMessageHandler {
    public constructor() {
        super(HandlerTypeEnum.backgroundScript);
    }

    // Template method implementations

    protected canHandleMessageCore(message: Message): boolean {
        return message.messageType === MessageTypeEnum.init;
    }

    protected async handlePortMessageCoreInternal(message: Message, port: chrome.runtime.Port): Promise<void> {
        logger.log(`::BackgroundMessageHandler received ${JSON.stringify(message)}`);

        // Raise event for listeners to handle
        this.emit('message', message);
    }

    protected async handleWindowPostMessageCore(message: Message): Promise<void> {
        return Promise.resolve();
    }
}
