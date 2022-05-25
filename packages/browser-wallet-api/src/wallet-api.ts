import {
    InjectedMessageHandler,
    createEventTypeFilter,
    EventType,
    MessageType,
} from '@concordium/browser-wallet-message-hub';
import { AccountTransaction } from '@concordium/web-sdk';
import { bigintToStringAccountTransactionFields } from './util';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type WalletEventHandler<T = any> = (payload: T) => void;

export interface IWalletApi {
    addChangeAccountListener(handler: WalletEventHandler<string>): void;
    /**
     * Sends a transaction to the Concordium Wallet and awaits the users action
     * @param transaction the transaction to be signed and sent. Note that the header can be omitted, and will be constructed by the wallet itself.
     * @param parameters parameters for the initContract and updateContract transactions in JSON-like format.
     * @param schema schema used for the initContract and updateContract transactions to serialize the parameters. Should be base64 encoded.
     */
    sendTransaction(
        transaction: AccountTransaction,
        parameters: Record<string, unknown>,
        schema: string
    ): Promise<string | undefined>;
    /**
     * Sends a transaction to the Concordium Wallet and awaits the users action
     * @param transaction the transaction to be signed and sent. Note that the header can be omitted, and will be constructed by the wallet itself.
     */
    sendTransaction(transaction: AccountTransaction): Promise<string | undefined>;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    signMessage(): Promise<any>;
    connect(): Promise<string | undefined>;
}

class WalletApi implements IWalletApi {
    private messageHandler = new InjectedMessageHandler();

    private connected = false;

    private eventHandlerMap: Map<EventType, WalletEventHandler[]> = new Map();

    constructor() {
        // set up event listeners
        this.handleEvent(EventType.ChangeAccount);
    }

    public addChangeAccountListener(handler: WalletEventHandler<string>) {
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
     * Requests connection to wallet. Resolves with account address or rejects if rejected in wallet.
     */
    public async connect(): Promise<string | undefined> {
        const response = await this.messageHandler.sendMessage<string | undefined | false>(MessageType.Connect);

        if (response === false) {
            throw new Error('Connection rejected');
        }

        this.connected = true;

        return response;
    }

    /**
     * Sends a transaction to the Concordium Wallet and awaits the users action
     */
    public sendTransaction(
        transaction: Omit<AccountTransaction, 'header'>,
        parameters?: Record<string, unknown>,
        schema?: string
    ): Promise<string | undefined> {
        return this.sendMessage(MessageType.SendTransaction, {
            transaction: bigintToStringAccountTransactionFields(transaction),
            parameters,
            schema,
        });
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    private async sendMessage<R>(type: MessageType, payload?: any): Promise<R> {
        if (!this.connected && !(await this.connect())) {
            throw new Error('Connection not allowed by wallet');
        }

        return this.messageHandler.sendMessage<R>(type, payload);
    }

    private handleEvent(type: EventType) {
        this.messageHandler.handleMessage(createEventTypeFilter(type), (msg) =>
            this.eventHandlerMap.get(type)?.forEach((eh) => eh(msg.payload))
        );
    }

    private addEventListener(type: EventType, handler: WalletEventHandler) {
        this.eventHandlerMap.set(type, this.eventHandlerMap.get(type) ?? [handler]);
    }
}

export const walletApi = new WalletApi();
