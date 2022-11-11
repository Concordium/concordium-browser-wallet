export interface WalletConnection {
    getConnectedAccount(): string | undefined;

    signAndSendTransaction(): Promise<string>;

    disconnect(): Promise<void>; // TODO unclear if this belongs here...
}

export class Network {
    name: string;

    genesisHash: string;

    constructor(name: string, genesisHash: string) {
        this.name = name;
        this.genesisHash = genesisHash;
    }
}


export interface WalletConnector {
    connect(network: Network): Promise<WalletConnection>;
}
