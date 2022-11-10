export interface WalletConnection {
    getConnectedAccount(): string;
    disconnect(): void;
    signAndSendTransaction(): Promise<string>;
}

export interface WalletConnector {
    connect(): Promise<WalletConnection>;
}
