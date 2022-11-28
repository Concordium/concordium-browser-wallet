import {
    AccountTransactionPayload,
    AccountTransactionSignature,
    AccountTransactionType,
    InitContractPayload,
    JsonRpcClient,
    SchemaVersion,
    UpdateContractPayload,
} from '@concordium/web-sdk';

// Copied from 'wallet-api-types.ts'.
type SendTransactionPayload =
    | Exclude<AccountTransactionPayload, UpdateContractPayload | InitContractPayload>
    | Omit<UpdateContractPayload, 'message'>
    | Omit<InitContractPayload, 'param'>;

export interface WalletConnection {
    // Should not be in 'WalletConnector' as the browser wallet's client doesn't work until there is a connection.
    getJsonRpcClient(): JsonRpcClient;

    signAndSendTransaction(
        accountAddress: string,
        type: AccountTransactionType.Update | AccountTransactionType.InitContract,
        payload: SendTransactionPayload,
        parameters: Record<string, unknown>,
        schema: string,
        schemaVersion?: SchemaVersion
    ): Promise<string>;

    signAndSendTransaction(
        accountAddress: string,
        type: AccountTransactionType,
        payload: SendTransactionPayload
    ): Promise<string>;

    signMessage(accountAddress: string, message: string): Promise<AccountTransactionSignature>;

    disconnect(): Promise<void>;
}

export class Network {
    name: string;

    genesisHash: string;

    jsonRpcUrl: string;

    constructor(name: string, genesisHash: string, jsonRpcUrl: string) {
        this.name = name;
        this.genesisHash = genesisHash;
        this.jsonRpcUrl = jsonRpcUrl;
    }
}

export interface Events {
    onChainChanged(chain: string): void;
    onAccountChanged(address: string | undefined): void;
    onDisconnect(): void;
}

export interface WalletConnector {
    connect(events: Events): Promise<WalletConnection>;
}

export async function withJsonRpcClient<T>(wc: WalletConnection, f: (c: JsonRpcClient) => Promise<T>) {
    return f(wc.getJsonRpcClient());
}
