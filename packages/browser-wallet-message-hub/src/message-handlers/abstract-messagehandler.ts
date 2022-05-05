/* eslint-disable no-restricted-syntax */
import { EventEmitter } from 'eventemitter3';
import { v4 as uuidv4 } from 'uuid';
import { getCurrentTab } from '../shared/utils/extensionHelpers';
import { filterMarkerGuid, Message } from './message';
import { logger } from './logger';
import { HandlerTypeEnum } from './handlertype-enum';

/**
 * Abstract class for message handlers
 */
export abstract class AbstractMessageHandler extends EventEmitter {
    // Used to filter out messages sent by myself
    private me$: HandlerTypeEnum;

    // Only in play if inheritor wants to be a conversation starter vs being a "listener,responder".
    private publisherPort$?: chrome.runtime.Port;

    protected constructor(me: HandlerTypeEnum) {
        super();
        this.me$ = me;
    }

    // Event listener for port messages
    public async onPortMessage(message: Message, port: chrome.runtime.Port): Promise<void> {
        logger.log('::PortMessage received');
        if (this.canHandleMessage(message)) {
            await this.handlePortMessageCore(message, port);
        }
    }

    // Event listener for window messages
    public async onWindowPostMessage(event: MessageEvent<Message>): Promise<void> {
        if (this.canHandleMessage(event.data)) {
            await this.handleWindowPostMessageCore(event.data);
        }
    }

    private onPublisherPortDisconnect(port: chrome.runtime.Port) {
        this.publisherPort$!.onDisconnect.removeListener(this.onPublisherPortDisconnect.bind(this));
        this.publisherPort$ = undefined;

        // Create a new Port
        this.createPortAndSetupEventListeners();
    }

    // Protected

    protected get me(): HandlerTypeEnum {
        return this.me$;
    }

    protected get publisherPort(): chrome.runtime.Port {
        if (!this.publisherPort$) {
            throw new Error('MessageHandler has not been configured as Port publisher initiator');
        }

        return this.publisherPort$;
    }

    protected canHandleMessage(message: Message): boolean {
        // Get rid of messages received from other websites or extensions
        if (message?.ccFilterMarker !== filterMarkerGuid) {
            // Ignore the message it doesnt seem to be a Concordium message
            return false;
        }

        // Handlers are not expected to act on messages sent by themselves
        if (message.from === this.me) {
            return false;
        }

        // This is a Concordium message, ask the child if it can handle the message
        return this.canHandleMessageCore(message);
    }

    public createPortAndSetupEventListeners(): void {
        this.publisherPort$ = chrome.runtime.connect({ name: uuidv4() });
        this.publisherPort$.onDisconnect.addListener(this.onPublisherPortDisconnect.bind(this));
        this.publisherPort$.onMessage.addListener(this.onPortMessage.bind(this));
    }

    public addWindowPostMessageEventListener() {
        window.addEventListener('message', this.onWindowPostMessage.bind(this));
    }

    // Template method operations to be implemented by all inheritors.
    protected abstract canHandleMessageCore(message: Message): boolean;
    protected abstract handleWindowPostMessageCore(message: Message): Promise<void>;
    protected abstract handlePortMessageCore(message: Message, port: chrome.runtime.Port): Promise<void>;

    protected abstract publishMessage(message: Message): void;
}
