/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable class-methods-use-this */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { getCurrentTab } from '../shared/utils/extensionHelpers';
import { AbstractMessageHandler, Subscription } from './abstract-messagehandler';
import { HandlerTypeEnum } from './handlertype-enum';
import { Message } from './message';
import { logger } from './logger';
import { MessageTypeEnum } from './messagetype-enum';

/**
 * Only handlers living in the Wallet "background/popup" space are supposed to inherit from this class.
 */
export interface IWalletMessageHandler {
    publishEvent(to: HandlerTypeEnum, payload: any): Promise<void>;
    subscribe(
        messageType: MessageTypeEnum,
        eventHandler: (payload: any, respond: (payload: any) => void, metadata?: chrome.runtime.MessageSender) => void
    ): Subscription;
    once(
        messageType: MessageTypeEnum,
        eventHandler: (payload: any, respond: (payload: any) => void, metadata?: chrome.runtime.MessageSender) => void
    ): void;
    unsubscribe(subscription: Subscription): void;
}

export class WalletMessageHandler extends AbstractMessageHandler implements IWalletMessageHandler {
    // Keeps track of known dApps that's "talking" to Concordium Wallet
    private tabsDictionary: Map<number, chrome.runtime.Port> = new Map<number, chrome.runtime.Port>();

    public constructor(me: HandlerTypeEnum) {
        super(me);

        // We only listen for messages arriving through the chrome.runtime.port channel.
        this.addRuntimePortListeners();
    }

    // Private
    private onPortDisconnect(port: chrome.runtime.Port): void {
        logger.log(`Port: ${port.name} disconnected`);

        // Remove any listeners associated with this port
        port.onDisconnect.removeListener(this.onPortDisconnect.bind(this));
        port.onMessage.removeListener(this.onPortMessage.bind(this));

        if (port.sender?.tab?.id !== undefined) {
            this.tabsDictionary.delete(port.sender.tab.id);
        }
    }

    /**
     * Main entry point for picking up Dapps ports.
     * @protected
     */
    private addRuntimePortListeners(): void {
        logger.log('::hookUpPortSendMessageMessageListener called');

        chrome.runtime.onConnect.addListener((port: chrome.runtime.Port) => {
            // Subscribe to lifecycle events for the current port
            port.onDisconnect.addListener(this.onPortDisconnect.bind(this));
            port.onMessage.addListener(this.onPortMessage.bind(this));

            if (port.sender?.tab?.id !== undefined) {
                logger.log(
                    `Added Port and Tab to Dictionary. Port ${port.name}, TabId:${port.sender.tab.id}, I am: ${this.me}`
                );
                this.tabsDictionary.set(port.sender.tab.id, port);
            }
        });
    }

    // Public

    public async publishEvent(to: HandlerTypeEnum, payload: any): Promise<void> {
        const event: Message = new Message(this.me, to, MessageTypeEnum.Event, payload);
        await this.publishMessage(event);
    }

    // Protected
    protected async publishMessage(message: Message): Promise<void> {
        let foundPort: chrome.runtime.Port | undefined;
        // We could not find any valid tabId for the message - send the message to the current tab
        const tab = await getCurrentTab();

        if (tab?.id && this.tabsDictionary.get(tab.id)) {
            foundPort = this.tabsDictionary.get(tab.id);
            if (!foundPort) {
                throw new Error('port is not defined');
            }
        } else {
            logger.log(`Could not find current tab or Port for message ${JSON.stringify(message)}, I am: ${this.me}`);
        }

        foundPort?.postMessage(message);
        logger.log(`Message ${JSON.stringify(message)} sent to Port:${foundPort?.name}, TabId:${tab.id}`);
    }

    // Template method implementations

    protected async handleWindowPostMessageCore(message: Message): Promise<void> {
        // We dont care about messages sent through window.postmessage
        return Promise.resolve();
    }

    protected canHandleMessageCore(message: Message): boolean {
        return true;
    }

    protected async handlePortMessageCore(message: Message, port: chrome.runtime.Port): Promise<void> {
        if (port.sender?.tab?.id !== undefined) {
            this.tabsDictionary.set(port.sender.tab.id, port);
        }

        const handlerMap = this.mapOfEventHandlers.get(message.messageType);

        if (handlerMap !== undefined) {
            // Execute every event handler
            handlerMap.forEach((c) => {
                c(
                    message.payload,
                    async (pl) => {
                        try {
                            const responseMessage = new Message(this.me, message.from, message.messageType, pl);
                            responseMessage.correlationId = message.correlationId;
                            port.postMessage(responseMessage);
                        } catch (e) {
                            // TODO: Add proper error logging
                        }
                        return Promise.resolve();
                    },
                    port.sender
                );
            });
        }
    }
}
