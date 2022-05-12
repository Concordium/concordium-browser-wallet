export enum ChromeStorageKey {
    Credentials = 'credentials',
    JsonRpcUrl = 'jsonRpcUrl',
    SelectedAccount = 'selectedAccont',
    UrlWhitelist = 'urlWhitelist',
}

export type WalletCredential = {
    key: string;
    address: string;
};
