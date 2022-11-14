import { JsonRpcClient } from '@concordium/web-sdk';

export interface WalletConnection {

    getJsonRpcClient(): JsonRpcClient;

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
    connect(network: Network): Promise<WalletConnection>;
}
