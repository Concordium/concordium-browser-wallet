import { InjectedMessageHandler, createEventTypeFilter, MessageType } from '@concordium/browser-wallet-message-hub';
import {
    AccountTransactionPayload,
    AccountTransactionSignature,
    AccountTransactionType,
    SchemaVersion,
} from '@concordium/web-sdk';
import { WalletApi as IWalletApi, EventType } from '@concordium/browser-wallet-api-helpers';
import EventEmitter from 'events';
import { stringify } from './util';

class WalletApi extends EventEmitter implements IWalletApi {
    private messageHandler = new InjectedMessageHandler();

    private connected = false;

    constructor() {
        super();

        // Set up message handlers to emit events.
        Object.values(EventType).forEach((eventType) => this.handleEvent(eventType));
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
        schema?: string,
        schemaVersion?: SchemaVersion
    ): Promise<string> {
        const response = await this.sendMessage<string | undefined>(MessageType.SendTransaction, {
            type,
            payload: stringify(payload),
            parameters,
            schema,
            schemaVersion,
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
        this.messageHandler.handleMessage(createEventTypeFilter(type), (msg) => this.emit(type, msg.payload));
    }
}

export const walletApi = new WalletApi();
