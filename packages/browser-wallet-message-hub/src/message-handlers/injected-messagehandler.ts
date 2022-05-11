/* eslint-disable class-methods-use-this */
import { AbstractMessageHandler } from './abstract-messagehandler';
import { WalletMessage } from '../messaging/message';
import { logger } from './logger';
import { HandlerType, MessageType, Payload } from './types';

/**
 * MessageHandler used in inside the injected script. Acts as the bridge between the WalletApi and ContentScript
 */
export class InjectedMessageHandler extends AbstractMessageHandler {
    public constructor() {
        super(HandlerType.InjectedScript);

        this.addWindowPostMessageEventListener();
    }

    /**
     * Called by users (WalletAPI) to publish Messages
     */
    public publishMessage(to: HandlerType, messageType: MessageType, payload: Payload): WalletMessage {
        const m = new WalletMessage(this.me, to, messageType, payload);
        window.postMessage(m);

        return m;
    }

    protected canHandleMessageCore(message: WalletMessage): boolean {
        return [HandlerType.BackgroundScript, HandlerType.PopupScript].includes(message.from);
    }

    protected handlePortMessageCore(): Promise<void> {
        return Promise.reject();
    }

    protected async handleWindowPostMessageCore(message: WalletMessage): Promise<void> {
        logger.log('::InjectedScript: Message was received from BackgroundScript or PopupScript');

        // Fire event to wallet api
        this.emit('message', message);
    }
}
