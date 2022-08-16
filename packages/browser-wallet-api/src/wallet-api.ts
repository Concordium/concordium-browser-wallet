import { InjectedMessageHandler, createEventTypeFilter, MessageType } from '@concordium/browser-wallet-message-hub';
import {
    AccountTransactionPayload,
    AccountTransactionSignature,
    AccountTransactionType,
    JsonRpcClient,
    SchemaVersion,
} from '@concordium/web-sdk';
import { WalletApi as IWalletApi, EventType } from '@concordium/browser-wallet-api-helpers';
import EventEmitter from 'events';
import type { JsonRpcRequest } from '@concordium/common-sdk/lib/providers/provider';
import JSONBig from 'json-bigint';
import { stringify } from './util';

class WalletApi extends EventEmitter implements IWalletApi {
    private messageHandler = new InjectedMessageHandler();

    private connected = false;

    private jsonRpcClient: JsonRpcClient;

    constructor() {
        super();
        // We pre-serialize the parameters before sending to the background script.
        const request = (...input: Parameters<JsonRpcRequest>) =>
            this.sendMessage<string>(MessageType.JsonRpcRequest, {
                method: input[0],
                params: JSONBig.stringify(input[1]),
            }).then((response) => {
                if (!response) {
                    throw new Error('RPC call rejected by wallet');
                }
                return response;
            });
        this.jsonRpcClient = new JsonRpcClient({ request });

        // Set up message handlers to emit events.
        Object.values(EventType).forEach((eventType) => this.handleEvent(eventType));
    }

    /**
     * Sends a sign request to the Concordium Wallet and awaits the users action
     */
    public async signMessage(accountAddress: string, message: string): Promise<AccountTransactionSignature> {
        const response = await this.sendMessage<AccountTransactionSignature | undefined>(MessageType.SignMessage, {
            accountAddress,
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

        // TODO Response becomes === null when we would expect it to be undefined. Catching it here is a temporary quick-fix.
        if (response === false || response === null) {
            throw new Error('Connection rejected');
        }

        this.connected = true;

        return response;
    }

    /**
     * Returns some connected account, prioritizing the one currently selected. Resolves with account address or undefined if there are no connected account.
     */
    public async getSelectedAccount(): Promise<string | undefined> {
        const response = await this.messageHandler.sendMessage<string | null>(MessageType.GetSelectedAccount);

        // TODO Response becomes === null when we would expect it to be undefined. Catching it here is a temporary quick-fix.
        if (response === null) {
            return undefined;
        }
        return response;
    }

    /**
     * Sends a transaction to the Concordium Wallet and awaits the users action
     */
    public async sendTransaction(
        accountAddress: string,
        type: AccountTransactionType,
        payload: AccountTransactionPayload,
        parameters?: Record<string, unknown>,
        schema?: string,
        schemaVersion?: SchemaVersion
    ): Promise<string> {
        const response = await this.sendMessage<string | undefined>(MessageType.SendTransaction, {
            accountAddress,
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

    public getJsonRpcClient(): JsonRpcClient {
        return this.jsonRpcClient;
    }
}

export const walletApi = new WalletApi();
