import {
    InjectedMessageHandler,
    createEventTypeFilter,
    EventType,
    PostMessageHandler,
    MessageType,
} from '@concordium/browser-wallet-message-hub';

export interface IWalletApi {
    sendTransaction(): Promise<boolean>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    signMessage(): Promise<any>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    getAccounts(): Promise<any[]>;
}

class WalletApi implements IWalletApi {
    private messageHandler = new InjectedMessageHandler();

    private eventHandlerMap: Map<EventType, PostMessageHandler[]> = new Map();

    constructor() {
        this.handleEvent(EventType.ChangeAccount);
        // Listens for events raised by InjectedScript
        // this.injectedMessageHandler.on('message', this.resolvePromiseOrFireEvent.bind(this));
    }

    public addChangeAccountListener(handler: PostMessageHandler) {
        this.addEventListener(EventType.ChangeAccount, handler);
    }

    /**
     * Sends a sign request to the Concordium Wallet and awaits the users action
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public signMessage(): Promise<any> {
        return this.messageHandler.sendMessage(MessageType.SignMessage, {});
    }

    /**
     * Requests list of accounts from the current connected network
     */
    // TODO use proper account type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public getAccounts(): Promise<any[]> {
        return this.messageHandler.sendMessage(MessageType.GetAccounts, {});
    }

    /**
     * Sends a transaction to the Concordium Wallet and awaits the users action
     */
    public sendTransaction(): Promise<boolean> {
        return this.messageHandler.sendMessage(MessageType.SendTransaction, {});
    }

    private handleEvent(type: EventType) {
        this.messageHandler.handleMessage(createEventTypeFilter(type), (msg) =>
            this.eventHandlerMap.get(type)?.forEach((eh) => eh(msg))
        );
    }

    private addEventListener(type: EventType, handler: PostMessageHandler) {
        this.eventHandlerMap.set(type, this.eventHandlerMap.get(type) ?? [handler]);
    }
}

export const walletApi = new WalletApi();
