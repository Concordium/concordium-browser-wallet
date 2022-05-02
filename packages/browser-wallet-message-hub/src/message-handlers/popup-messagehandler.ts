import { HandlerTypeEnum } from './handlertype-enum';
import { Message } from './message';
import { logger } from './logger';
import { MessageTypeEnum } from './messagetype-enum';
import { AbstractExtensionMessageHandler } from './extension-messagehandler';

export class PopupMessageHandler extends AbstractExtensionMessageHandler {
    public constructor() {
        super(HandlerTypeEnum.popupScript);
    }

    // Template method implementations

    protected canHandleMessageCore(message: Message): boolean {
        return message.messageType === MessageTypeEnum.sendTransaction;
    }

    protected async handlePortMessageCoreInternal(message: Message, port: chrome.runtime.Port): Promise<void> {
        logger.log(`::PopupMessageHandler received ${JSON.stringify(message)}`);

        // Respond with message
        const responseMessage: Message = new Message(
            HandlerTypeEnum.popupScript,
            HandlerTypeEnum.injectedScript,
            MessageTypeEnum.sendTransaction,
            {}
        );
        responseMessage.correlationId = message.correlationId;

        this.publishMessage(responseMessage);
    }

    protected handleWindowPostMessageCore(message: Message): Promise<void> {
        throw new Error('Method not implemented.');
    }
}
