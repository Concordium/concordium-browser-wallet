/* eslint-disable class-methods-use-this */
import { HandlerTypeEnum } from './handlertype-enum';
import { Message } from './message';
import { logger } from './logger';
import { MessageTypeEnum } from './messagetype-enum';
import { AbstractWalletMessageHandler } from './abstract-wallet-messagehandler';

export class PopupMessageHandler extends AbstractWalletMessageHandler {
    public constructor() {
        super(HandlerTypeEnum.PopupScript);
    }

    // Template method implementations

    protected canHandleMessageCore(message: Message): boolean {
        return message.messageType === MessageTypeEnum.SendTransaction;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async handlePortMessageCoreInternal(message: Message, port: chrome.runtime.Port): Promise<void> {
        logger.log(`::PopupMessageHandler received ${JSON.stringify(message)}`);

        // Respond with message
        const responseMessage: Message = new Message(
            HandlerTypeEnum.PopupScript,
            HandlerTypeEnum.InjectedScript,
            MessageTypeEnum.SendTransaction,
            {}
        );
        responseMessage.correlationId = message.correlationId;

        await this.publishMessage(responseMessage);
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected handleWindowPostMessageCore(message: Message): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
