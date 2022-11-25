import { JsonRpcClient } from '@concordium/web-sdk';

export interface WalletConnection {
    // Must be in connection as the browser wallet's client won't work until there is a connection.
    getJsonRpcClient(): JsonRpcClient;

    signAndSendTransaction(): Promise<string>;

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
