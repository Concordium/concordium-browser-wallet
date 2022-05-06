/* eslint-disable class-methods-use-this */
import { AbstractMessageHandler } from './abstract-messagehandler';
import { Message } from './message';
import { HandlerTypeEnum } from './handlertype-enum';
import { logger } from './logger';

export class ContentMessageHandler extends AbstractMessageHandler {
    public constructor() {
        super(HandlerTypeEnum.ContentScript);

        // Listen forward all PostMessage sent from Dapp
        this.addWindowPostMessageEventListener();

        // Create a runtime port for communication with runtime port message listeners (Background and popup)
        this.createPortAndSetupEventListeners();
    }

    public publishMessage(message: Message): void {
        logger.log('::contentMessageHandler.publishMessage');
        this.publisherPort.postMessage(message);
    }

    // Template method implementations

    protected canHandleMessageCore(message: Message): boolean {
        return (
            (message.from === HandlerTypeEnum.InjectedScript &&
                [HandlerTypeEnum.BackgroundScript, HandlerTypeEnum.PopupScript].includes(message.to)) ||
            (message.to === HandlerTypeEnum.InjectedScript &&
                [HandlerTypeEnum.BackgroundScript, HandlerTypeEnum.PopupScript].includes(message.from))
        );
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected async handlePortMessageCore(message: Message, port: chrome.runtime.Port): Promise<void> {
        logger.log(`::ContentMessageHandler.handlePortMessageCore: ${JSON.stringify(message)}`);

        // We only expect messages from Backup or Popup sent to Injected script
        window.postMessage(message, '*');
    }

    protected async handleWindowPostMessageCore(message: Message): Promise<void> {
        if (!this.publisherPort) {
            throw new Error('Publisher port is not defined');
        }

        // We have received a message from the dApp -> pass it on to the extension
        this.publisherPort.postMessage(message);
    }
}
