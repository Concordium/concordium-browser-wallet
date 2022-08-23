export enum ChromeStorageKey {
    ConnectedSites = 'connectedSites',
    Credentials = 'credentials',
    NetworkConfiguration = 'networkConfiguration',
    SelectedAccount = 'selectedAccont',
    SeedPhrase = 'seedPhrase',
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

interface EncryptionMetaData {
    keyLen: number;
    iterations: number;
    salt: string;
    initializationVector: string;
    encryptionMethod: string;
    keyDerivationMethod: string;
    hashAlgorithm: string;
}

export interface EncryptedData {
    cipherText: string;
    metadata: EncryptionMetaData;
}

export interface NetworkConfiguration {
    genesisHash: string;
    name: string;
    jsonRpcUrl: string;
    explorerUrl: string;
}
