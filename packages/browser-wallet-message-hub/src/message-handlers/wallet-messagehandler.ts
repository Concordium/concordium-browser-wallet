import { getCurrentTab } from '../shared/utils/extensionHelpers';
import { AbstractMessageHandler, Subscription } from './abstract-messagehandler';
import { Message } from './message';
import { logger } from './logger';
import { EventHandler, HandlerType, MessageType, Payload } from './types';

/**
 * Only handlers living in the Wallet "background/popup" space are supposed to inherit from this class.
 */
export interface IWalletMessageHandler {
    publishEvent(to: HandlerType, payload: Payload): Promise<void>;
    publishMessage(message: Message): Promise<void>;
    publishMessage(to: HandlerType, messageType: MessageType, payload: Payload): Promise<void>;
    subscribe(messageType: MessageType, eventHandler: EventHandler): Subscription;
    handleOnce(messageType: MessageType, eventHandler: EventHandler): void;
    unsubscribe(subscription: Subscription): void;
}

export class WalletMessageHandler extends AbstractMessageHandler implements IWalletMessageHandler {
    // Keeps track of known dApps that's "talking" to Concordium Wallet
    private tabsDictionary: Map<number, chrome.runtime.Port> = new Map<number, chrome.runtime.Port>();

    public constructor(me: HandlerType) {
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

    public async publishEvent(to: HandlerType, payload: Payload): Promise<void> {
        const event: Message = new Message(this.me, to, MessageType.Event, payload);
        await this.publishMessage(event);
    }

    public async publishMessage(message: Message): Promise<void>;
    public async publishMessage(to: HandlerType, messageType: MessageType, payload: Payload): Promise<void>;
    public async publishMessage(
        dyn: Message | HandlerType,
        messageType?: MessageType,
        payload?: Payload
    ): Promise<void> {
        if (dyn instanceof Message) {
            let foundPort: chrome.runtime.Port | undefined;
            // We could not find any valid tabId for the message - send the message to the current tab
            const tab = await getCurrentTab();

            if (tab?.id && this.tabsDictionary.get(tab.id)) {
                foundPort = this.tabsDictionary.get(tab.id);
                if (!foundPort) {
                    throw new Error('port is not defined');
                }

                foundPort?.postMessage(dyn);
                logger.log(`Message ${JSON.stringify(dyn)} sent to Port:${foundPort?.name}, TabId:${tab.id}`);
            } else {
                logger.log(`Could not find current tab or Port for message ${JSON.stringify(dyn)}, I am: ${this.me}`);
            }
        } else if (messageType !== undefined) {
            this.publishMessage(new Message(this.me, dyn, messageType, payload));
        }
    }

    // Protected

    protected async handleWindowPostMessageCore(): Promise<void> {
        // We dont care about messages sent through window.postmessage
        return Promise.resolve();
    }

    protected canHandleMessageCore(): boolean {
        return true;
    }

    protected async handlePortMessageCore(message: Message, port: chrome.runtime.Port): Promise<void> {
        if (port.sender?.tab?.id !== undefined) {
            this.tabsDictionary.set(port.sender.tab.id, port);
        }

        const handlerMap = this.mapOfEventHandlers.get(message.type);
        handlerMap?.forEach((handler) => {
            handler(message, (pl) => port.postMessage(this.createResponse(message, pl)), port.sender);
        });
    }
}
