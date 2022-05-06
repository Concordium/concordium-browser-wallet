/* eslint-disable class-methods-use-this */
import { HandlerTypeEnum } from './handlertype-enum';
import { Message } from './message';
import { logger } from './logger';
import { MessageTypeEnum } from './messagetype-enum';
import { AbstractWalletMessageHandler } from './abstract-wallet-messagehandler';

/**
 * Only responsibility is to listen for the "init" message and raise corresponding event.
 */
export class BackgroundMessageHandler extends AbstractWalletMessageHandler {
    public constructor() {
        super(HandlerTypeEnum.BackgroundScript);
        this.addRuntimePortListeners();
    }

    // Template method implementations

    protected canHandleMessageCore(message: Message): boolean {
        return message.messageType === MessageTypeEnum.Init;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async handlePortMessageCoreInternal(message: Message, port: chrome.runtime.Port): Promise<void> {
        logger.log(`::BackgroundMessageHandler received ${JSON.stringify(message)}`);

        // Raise event for listeners to handle
        this.emit('message', message);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async handleWindowPostMessageCore(message: Message): Promise<void> {
        return Promise.resolve();
    }
}
