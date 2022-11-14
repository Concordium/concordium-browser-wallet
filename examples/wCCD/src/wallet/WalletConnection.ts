import { JsonRpcClient } from '@concordium/web-sdk';

export interface WalletConnection {
    getConnectedAccount(): string | undefined;

    signAndSendTransaction(): Promise<string>;

    disconnect(): Promise<void>; // TODO unclear if this belongs here...
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

export interface WalletConnector {
    getJsonRpcClient(): JsonRpcClient;

    connect(): Promise<WalletConnection>;
}

export async function withJsonRpcClient<T>(wc: WalletConnector, f: (c: JsonRpcClient) => Promise<T>) {
    return f(wc.getJsonRpcClient());
}
