export enum ChromeStorageKey {
    ConnectedSites = 'connectedSites',
    Credentials = 'credentials',
    JsonRpcUrl = 'jsonRpcUrl',
    SelectedAccount = 'selectedAccont',
    UrlWhitelist = 'urlWhitelist',
    Theme = 'theme',
}

export enum Theme {
    Light = 'light',
    Dark = 'dark',
}

export type WalletCredential = {
    key: string;
    address: string;
};
