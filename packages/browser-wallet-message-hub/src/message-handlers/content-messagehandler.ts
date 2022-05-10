/* eslint-disable class-methods-use-this */
import { AbstractMessageHandler } from './abstract-messagehandler';
import { Message } from './message';
import { logger } from './logger';
import { HandlerType, MessageType, Payload } from './types';

export class ContentMessageHandler extends AbstractMessageHandler {
    public constructor() {
        super(HandlerType.ContentScript);

        // Listen forward all PostMessage sent from Dapp
        this.addWindowPostMessageEventListener();

        // Create a runtime port for communication with runtime port message listeners (Background and popup)
        this.createPortAndSetupEventListeners();
    }

    /**
     * Publishes a message to the Wallet background/popup space
     */
    public publishMessage(to: HandlerType, messageType: MessageType, payload: Payload): Message {
        logger.log('::contentMessageHandler.publishMessage');

        const m = new Message(this.me, to, messageType, payload);
        this.publisherPort.postMessage(m);

        return m;
    }

    // Template method implementations

    protected canHandleMessageCore(message: Message): boolean {
        logger.log('::CanHandleMessageCore');
        return (
            (message.from === HandlerType.InjectedScript &&
                [HandlerType.BackgroundScript, HandlerType.PopupScript].includes(message.to)) ||
            (message.to === HandlerType.InjectedScript &&
                [HandlerType.BackgroundScript, HandlerType.PopupScript].includes(message.from))
        );
    }

    protected async handlePortMessageCore(message: Message): Promise<void> {
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
