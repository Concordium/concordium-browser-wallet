import { AbstractMessageHandler } from './abstract-messagehandler';
import { Message } from './message';
import { HandlerTypeEnum } from './handlertype-enum';
import { logger } from './logger';

export class InjectedMessageHandler extends AbstractMessageHandler {
    protected portDisconnectCore(port: chrome.runtime.Port): void {
        throw new Error('Method not implemented.');
    }

    public constructor() {
        super(HandlerTypeEnum.injectedScript);

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
        return [HandlerTypeEnum.backgroundScript, HandlerTypeEnum.popupScript].includes(message.from);
    }

    protected handlePortMessageCore(message: Message, port: chrome.runtime.Port): Promise<void> {
        throw new Error('Not supported in injected script');
    }

    protected async handleWindowPostMessageCore(message: Message): Promise<void> {
        logger.log('::InjectedScript: Message was received from BackgroundScript or PopupScript');

        // Fire event to wallet api
        this.emit('message', message);
    }
}
