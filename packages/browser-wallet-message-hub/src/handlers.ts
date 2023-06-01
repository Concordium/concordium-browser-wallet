/* eslint-disable max-classes-per-file */
import { EventType } from '@concordium/browser-wallet-api-helpers';
import {
    BaseMessage,
    isEvent,
    isMessage,
    isResponse,
    WalletEvent,
    WalletMessage,
    WalletResponse,
    MessageType,
    InternalMessageType,
    WalletError,
    isError,
} from './message';

type Unsubscribe = () => void;
type MessageFilter<M extends BaseMessage> = (msg: M) => boolean;

export type PostMessageHandler<M extends BaseMessage | unknown = WalletResponse | WalletEvent> = (message: M) => void;

export type ExtensionMessageHandler<M extends BaseMessage | unknown = WalletMessage> = (
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
     * Handle messages fitlered by the passed "filter" callback. Usually you'd add 1 handler pr. message.
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
     * Handle first message matching the passed "filter" callback. Unsubscribes automatically when handled.
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

export class InjectedMessageHandler extends BaseMessageHandler<WalletResponse | WalletEvent | WalletError> {
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
    public async sendMessage<R>(type: MessageType, payload?: any): Promise<R> {
        const msg = new WalletMessage(type, payload);
        window.postMessage(msg);

        return new Promise((resolve, reject) => {
            this.handleOnce(
                (mr) => (isResponse(mr) || isError(mr)) && msg.correlationId === mr.correlationId,
                (mr) => (isError(mr) ? reject(mr.error) : resolve(mr.payload))
            );
        });
    }

    public override handleMessage(
        filter: MessageFilter<WalletResponse | WalletEvent | WalletError>,
        handler: PostMessageHandler
    ): Unsubscribe {
        return super.handleMessage(filter, handler);
    }

    public override handleOnce(
        filter: MessageFilter<WalletResponse | WalletEvent | WalletError>,
        handler: PostMessageHandler
    ): Unsubscribe {
        return super.handleOnce(filter, handler);
    }

    protected canHandleMessage(
        msg: unknown,
        filter: MessageFilter<WalletResponse | WalletEvent | WalletError>
    ): msg is WalletResponse | WalletEvent | WalletError {
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
    public async sendInitEvent() {
        return chrome.runtime.sendMessage(new WalletMessage(InternalMessageType.Init));
    }

    private setupMessageBridge() {
        // Propagate messages from inject -> extension
        window.addEventListener('message', ({ data: msg }) => {
            if (isMessage(msg)) {
                chrome.runtime
                    .sendMessage(msg)
                    .then((response: WalletError | unknown) => {
                        if (isError(response)) {
                            // If an error is thrown in the background script, propagate it to inject.
                            throw new Error(response.error ?? undefined);
                        }

                        window.postMessage(new WalletResponse(msg, response));
                    })
                    .catch((error: Error) => window.postMessage(new WalletError(msg, error.message)));
            }
        });

        // Propagate events from extension -> inject
        chrome.runtime.onMessage.addListener((msg) => {
            if (isEvent(msg)) {
                window.postMessage(msg);
            }
        });
    }
}

type BroadcastOptions = {
    /**
     * Disable whitelist requirement for broadcast method
     *
     * @example
     * handler.broadcast(EventType.ChainChanged, undefined, {requireWhitelist: false});
     */
    requireWhitelist?: boolean;
    /**
     * Callback to be run for each non-whitelisted tab. This runs even if whitelist is disabled.
     *
     * @example
     * handler.broadcast(EventType.ChangeAccount, "1234", {nonWhitelistedTabCallback: (tab: chrome.tabs.Tab) => ...});
     */
    nonWhitelistedTabCallback?(tab: chrome.tabs.Tab): void;
};
const defaultBroadcastOptions: BroadcastOptions = { requireWhitelist: true };

export class ExtensionsMessageHandler extends BaseMessageHandler<WalletMessage> {
    constructor(
        private allowlist: { get(): Promise<Record<string, string[]> | undefined> },
        private selectedAccount: { get(): Promise<string | undefined> }
    ) {
        super();
    }

    /**
     * Send event of specific type with optional payload and response handler
     *
     * @example
     * handler.sendInternalMessage(InternalMessageType.SignMessage, "Hello world!").then(handleResponse);
     */
    // TODO would be nice to make this more type safe.
    public async sendInternalMessage(
        type: InternalMessageType,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        payload?: any
    ) {
        return chrome.runtime.sendMessage(new WalletMessage(type, payload));
    }

    /**
     * Broadcast an event of a specific type, with an optional payload, to all currently
     * open and allowlisted (connected to the selected account) tabs.
     *
     * By specifying options, it's possible to disable the whitelist by `{requireWhitelist: false}`
     * and also declare a callback to be called for tabs not included in the whitelist through `{nonWhitelistedTabCallback: (t: chrome.tabs.Tab) => ...}`
     * Default options are {requireWhitelist: true}
     *
     * @example
     * handler.broadcast(EventType.ChangeAccount, "1234");
     * handler.broadcast(EventType.ChainChanged, undefined, {requireWhitelist: false});
     * handler.broadcast(EventType.ChangeAccount, "1234", {nonWhitelistedTabCallback: handlerFunction});
     */
    // TODO would be nice to make this more type safe.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public broadcast(type: EventType, payload?: any, options: BroadcastOptions = {}): void {
        const optionsWithDefaults = { ...defaultBroadcastOptions, ...options };
        chrome.tabs
            .query({}) // get all
            .then((ts) =>
                this.getWhitelistedTabs(ts).then((wl) => ({
                    valid: optionsWithDefaults.requireWhitelist ? wl : ts,
                    invalid: ts.filter((t) => !wl.some((w) => w.id === t.id)),
                }))
            )
            .then(({ valid, invalid }) => {
                valid
                    .filter(({ id }) => id !== undefined)
                    .forEach((t) => this.sendEventToTab(t.id as number, new WalletEvent(type, payload)));

                if (optionsWithDefaults.nonWhitelistedTabCallback !== undefined) {
                    invalid.forEach(optionsWithDefaults.nonWhitelistedTabCallback);
                }
            });
    }

    /**
     * Broadcast event of a specific type with an optional payload to open tabs with the provided URL.
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public async broadcastToUrl(type: EventType, tabUrl: string, payload?: any): Promise<void[]> {
        const tabsRestrictedToUrl = await chrome.tabs.query({ url: `${tabUrl}/*` });
        const sendToTabsPromises = tabsRestrictedToUrl
            .filter((tab) => tab.id !== undefined)
            .map((t) => this.sendEventToTab(t.id as number, new WalletEvent(type, payload)));
        return Promise.all(sendToTabsPromises);
    }

    public override handleMessage(filter: MessageFilter<WalletMessage>, handler: ExtensionMessageHandler): Unsubscribe {
        return super.handleMessage(filter, this.ensureHandlerArgs(handler));
    }

    public override handleOnce(filter: MessageFilter<WalletMessage>, handler: ExtensionMessageHandler): Unsubscribe {
        return super.handleOnce(filter, this.ensureHandlerArgs(handler));
    }

    protected canHandleMessage(msg: unknown, filter: MessageFilter<WalletMessage>): msg is WalletMessage {
        return isMessage(msg) && filter(msg);
    }

    protected onAddHandler(handler: ExtensionMessageHandler<unknown>): Unsubscribe {
        chrome.runtime.onMessage.addListener(handler);

        return () => chrome.runtime.onMessage.removeListener(handler);
    }

    private ensureHandlerArgs(handler: ExtensionMessageHandler): MessageHandler<WalletMessage> {
        return (msg, sender, respond) => {
            if (sender === undefined || respond === undefined) {
                throw new Error('Unreachable');
            }

            return handler(msg, sender, respond);
        };
    }

    private async getWhitelistedTabs(tabs: chrome.tabs.Tab[]): Promise<chrome.tabs.Tab[]> {
        const allowlist = await this.allowlist.get();
        const selectedAccount = await this.selectedAccount.get();

        let whitelistedUrls: string[] = [];
        if (selectedAccount && allowlist) {
            whitelistedUrls = Object.entries(allowlist)
                .filter((entry) => entry[1].includes(selectedAccount))
                .map((val) => val[0]);
        }

        return tabs.filter(({ url }) => url !== undefined && whitelistedUrls?.includes(new URL(url).origin));
    }

    private async sendEventToTab(tabId: number, event: WalletEvent) {
        try {
            const response = chrome.tabs.sendMessage(
                tabId,
                event
                // type returned from type definition is wrong compared to documentation: https://developer.chrome.com/docs/extensions/reference/tabs/#method-sendMessage
            ) as unknown as Promise<void>;
            await response;
        } catch {
            // This is expected, as we don't ever expect a response to be sent to events broadcasted from the extension.
        }
    }
}
