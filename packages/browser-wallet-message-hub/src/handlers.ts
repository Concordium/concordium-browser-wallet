/* eslint-disable max-classes-per-file */
import {
    BaseMessage,
    isEvent,
    isMessage,
    isResponse,
    WalletEvent,
    WalletMessage,
    WalletResponse,
    MessageType,
    EventType,
} from './message';

type Unsubscribe = () => void;
type MessageFilter<M extends BaseMessage> = (msg: M) => boolean;

export type PostMessageHandler<M extends BaseMessage | unknown = WalletResponse | WalletEvent> = (message: M) => void;

export type ExtensionMessageHandler<M extends BaseMessage | unknown = WalletMessage | WalletEvent> = (
    message: M,
    sender: chrome.runtime.MessageSender,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    respond: (response: any) => void
) => true | void;

export type MessageHandler<M extends BaseMessage | unknown> = (
    message: M,
    sender?: chrome.runtime.MessageSender,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    respond?: (response: any) => void
) => true | void;

abstract class BaseMessageHandler<M extends BaseMessage = WalletMessage> {
    /**
     * Handle messages fitlered by the passed "fiter" callback. Usually you'd add 1 handler pr. message.
     *
     * @example
     * const unsub = messageHandler.handleMessage((msg) => msg.messageType === MessageType.SendTransaction, (msg, sender, respond) => respond(true));
     *
     * @returns function to unsubscribe handler
     */
    public handleMessage(filter: MessageFilter<M>, handler: MessageHandler<M>): Unsubscribe {
        // eslint-disable-next-line consistent-return
        return this.onAddHandler((msg, ...args) => {
            if (this.canHandleMessage(msg, filter)) {
                return handler(msg, ...args);
            }
        });
    }

    /**
     * Handle first message matching the passed "fiter" callback. Unsubscribes automatically when handled.
     *
     * @example
     * const unsub = messageHandler.handleOnce((msg) => msg.eventType === EventType.PopupReady, (msg, sender, respond) => respond(true));
     *
     * @returns function to unsubscribe handler prior to first execution
     */
    public handleOnce(filter: MessageFilter<M>, handler: MessageHandler<M>): Unsubscribe {
        const unsub = this.handleMessage(filter, (...args) => {
            unsub();
            return handler(...args);
        });

        return unsub;
    }

    /**
     * Specifies scenarios where a message handler can handle the message
     *
     * @returns whether a message received is supported or not.
     */
    protected abstract canHandleMessage(msg: unknown, filter: MessageFilter<M>): msg is M;
    /**
     * Specifies how to add the event handler, i.e. which API to use to listen for messages
     *
     * @returns function to use for unsubscribing the handler.
     */
    protected abstract onAddHandler(handler: MessageHandler<unknown>): Unsubscribe;
}

export class InjectedMessageHandler extends BaseMessageHandler<WalletResponse | WalletEvent> {
    /**
     * Send message of specific type with optional payload
     *
     * @example
     * handler.sendMessage(MessageType.SignMessage, "Hello world!").then(handleResponse);
     *
     * @returns Promise resolving with response to message
     */
    // TODO would be nice to make this more type safe.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public sendMessage(type: MessageType, payload?: any): Promise<any> {
        const msg = new WalletMessage(type, payload);
        window.postMessage(msg);

        return new Promise((resolve) => {
            this.handleOnce(
                (mr) => isResponse(mr) && msg.correlationId === mr.correlationId,
                (mr) => resolve(mr.payload)
            );
        });
    }

    public override handleMessage(
        filter: MessageFilter<WalletResponse | WalletEvent>,
        handler: PostMessageHandler
    ): Unsubscribe {
        return super.handleMessage(filter, handler);
    }

    public override handleOnce(
        filter: MessageFilter<WalletResponse | WalletEvent>,
        handler: PostMessageHandler
    ): Unsubscribe {
        return super.handleOnce(filter, handler);
    }

    protected canHandleMessage(
        msg: unknown,
        filter: MessageFilter<WalletResponse | WalletEvent>
    ): msg is WalletResponse | WalletEvent {
        return (isResponse(msg) || isEvent(msg)) && filter(msg);
    }

    protected onAddHandler(handler: PostMessageHandler<unknown>): Unsubscribe {
        // Make sure events sent from extension is handled. Right now only MessageResponse is handled.
        const wrapper = ({ data }: MessageEvent<unknown>) => handler(data);
        window.addEventListener('message', wrapper);

        return () => window.removeEventListener('message', wrapper);
    }
}

export class ContentMessageHandler {
    constructor() {
        this.setupMessageBridge();
    }

    /**
     * Send content script init event to chrome runtime
     */
    public sendInitEvent() {
        chrome.runtime.sendMessage(new WalletEvent(EventType.Init));
    }

    private setupMessageBridge() {
        // Propagate messages from inject -> extension
        window.addEventListener('message', ({ data }) => {
            if (isMessage(data)) {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                chrome.runtime.sendMessage(data, (response: any) =>
                    window.postMessage(new WalletResponse(data, response))
                );
            }
        });

        // Propagate events from extension -> inject
        chrome.runtime.onMessage.addListener((msg) => {
            if (isEvent(msg)) {
                window.postMessage(msg);
            }

            return false;
        });
    }
}

export class ExtensionsMessageHandler extends BaseMessageHandler<WalletMessage | WalletEvent> {
    /**
     * Send event of specific type with optional payload and response handler
     *
     * @example
     * handler.sendInternalEvent(EventType.Init);
     * handler.sendInternalEvent(EventType.SignMessage, "Hello world!", handleResponse);
     */
    // TODO would be nice to make this more type safe.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public sendInternalEvent(type: EventType, payload?: any, onResponse: (response: any) => void = () => {}): void {
        chrome.runtime.sendMessage(new WalletEvent(type, payload), onResponse);
    }

    /**
     * Send event of specific type with optional payload
     *
     * @example
     * handler.broadcast(EventType.ChangeAccount, "1234");
     */
    // TODO would be nice to make this more type safe.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public broadcast(type: EventType, payload?: any): void {
        // For now, send the message to all tabs. TODO figure out how to send only to connected tabs.
        chrome.tabs.query({}, (tabs) =>
            tabs
                .filter((t) => t.id !== undefined)
                .forEach((t) => {
                    chrome.tabs.sendMessage(t.id as number, new WalletEvent(type, payload));
                })
        );
    }

    public override handleMessage(
        filter: MessageFilter<WalletMessage | WalletEvent>,
        handler: ExtensionMessageHandler
    ): Unsubscribe {
        return super.handleMessage(filter, this.ensureHandlerArgs(handler));
    }

    public override handleOnce(
        filter: MessageFilter<WalletMessage | WalletEvent>,
        handler: ExtensionMessageHandler
    ): Unsubscribe {
        return super.handleOnce(filter, this.ensureHandlerArgs(handler));
    }

    protected canHandleMessage(
        msg: unknown,
        filter: MessageFilter<WalletMessage | WalletEvent>
    ): msg is WalletMessage | WalletEvent {
        return (isMessage(msg) || isEvent(msg)) && filter(msg);
    }

    protected onAddHandler(handler: ExtensionMessageHandler<unknown>): Unsubscribe {
        chrome.runtime.onMessage.addListener(handler);

        return () => chrome.runtime.onMessage.removeListener(handler);
    }

    private ensureHandlerArgs(handler: ExtensionMessageHandler): MessageHandler<WalletMessage | WalletEvent> {
        return (msg, sender, respond) => {
            if (sender === undefined || respond === undefined) {
                throw new Error('Unreachable');
            }

            return handler(msg, sender, respond);
        };
    }
}
