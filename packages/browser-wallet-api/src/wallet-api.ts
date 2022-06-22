import {
    InjectedMessageHandler,
    createEventTypeFilter,
    EventType,
    MessageType,
} from '@concordium/browser-wallet-message-hub';
import { AccountTransactionPayload, AccountTransactionSignature, AccountTransactionType } from '@concordium/web-sdk';
import { WalletApi as IWalletApi, WalletEventHandler } from '@concordium/browser-wallet-api-helpers';
import { stringify } from './util';

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
    public async signMessage(message: string): Promise<AccountTransactionSignature> {
        const response = await this.sendMessage<AccountTransactionSignature | undefined>(MessageType.SignMessage, {
            message,
        });

        if (!response) {
            throw new Error('Signing rejected');
        }

        return response;
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
    public async sendTransaction(
        type: AccountTransactionType,
        payload: AccountTransactionPayload,
        parameters?: Record<string, unknown>,
        schema?: string
    ): Promise<string> {
        const response = await this.sendMessage<string | undefined>(MessageType.SendTransaction, {
            type,
            payload: stringify(payload),
            parameters,
            schema,
        });

        if (!response) {
            throw new Error('Signing rejected');
        }

        return response;
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
