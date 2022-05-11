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

    private connected = false;

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
        return this.sendMessage(MessageType.SignMessage, {});
    }

    /**
     * Requests list of accounts from the current connected network
     */
    // TODO use proper account type
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    public getAccounts(): Promise<any[]> {
        return this.sendMessage(MessageType.GetAccounts);
    }

    public async connect(): Promise<boolean> {
        this.connected = await this.messageHandler.sendMessage(MessageType.Connect);
        return this.connected;
    }

    /**
     * Sends a transaction to the Concordium Wallet and awaits the users action
     */
    public sendTransaction(): Promise<boolean> {
        return this.sendMessage(MessageType.SendTransaction, {});
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async sendMessage(type: MessageType, payload?: any) {
        if (!this.connected && !(await this.connect())) {
            throw new Error('Connection not allowed by wallet');
        }

        return this.messageHandler.sendMessage(type, payload);
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
