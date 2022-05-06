import { AbstractMessageHandler } from './abstract-messagehandler';
import { Message } from './message';
import { HandlerTypeEnum } from './handlertype-enum';
import { logger } from './logger';

export class InjectedMessageHandler extends AbstractMessageHandler {
    public constructor() {
        super(HandlerTypeEnum.InjectedScript);

        this.addWindowPostMessageEventListener();
    }

    /**
     * Called by users (WalletAPI) to publish Messages
     * @param message
     */
    public publishMessage(message: Message): void {
        window.postMessage(message);
    }

    protected canHandleMessageCore(message: Message): boolean {
        return message.from === HandlerTypeEnum.BackgroundScript || message.from === HandlerTypeEnum.PopupScript;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected handlePortMessageCore(message: Message, port: chrome.runtime.Port): Promise<void> {
        return Promise.reject();
    }

    protected async handleWindowPostMessageCore(message: Message): Promise<void> {
        logger.log('::InjectedScript: Message was received from BackgroundScript or PopupScript');

        // Fire event to wallet api
        this.emit('message', message);
    }
}
