export enum ChromeStorageKey {
    Credentials = 'credentials',
    JsonRpcUrl = 'jsonRpcUrl',
    SelectedAccount = 'selectedAccont',
    UrlWhitelist = 'urlWhitelist',
    Theme = 'theme',
    PendingIdentities = 'pendingIdentities',
}

export enum Theme {
    Light = 'light',
    Dark = 'dark',
}

export enum Network {
    Testnet = 1,
    Mainnet = 919,
}

export type WalletCredential = {
    key: string;
    address: string;
};

export type PendingIdentity = {
    index: number;
    network: Network;
    provider: number;
    location?: string;
};
