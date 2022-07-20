export enum ChromeStorageKey {
    Credentials = 'credentials',
    JsonRpcUrl = 'jsonRpcUrl',
    SelectedAccount = 'selectedAccont',
    UrlWhitelist = 'urlWhitelist',
    Theme = 'theme',
    PendingIdentities = 'pendingIdentities',
    SelectedIdentity = 'selectedIdentity',
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

export type Identity = {
    name: string;
    index: number;
    network: Network;
};

export type PendingIdentity = Identity & {
    provider: number;
    location?: string;
};
