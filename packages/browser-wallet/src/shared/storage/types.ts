export enum ChromeStorageKey {
    ConnectedSites = 'connectedSites',
    Credentials = 'credentials',
    JsonRpcUrl = 'jsonRpcUrl',
    SelectedAccount = 'selectedAccont',
    Theme = 'theme',
    PendingIdentity = 'pendingIdentity',
    Identities = 'identities',
    SelectedIdentity = 'selectedIdentity',
    SeedPhrase = 'seedPhrase',
    IdentityProviders = 'identityProviders',
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

export enum IdentityStatus {
    Pending = 'pending',
    Confirmed = 'confirmed',
    Rejected = 'rejected',
}

export interface BaseIdentity {
    id: number;
    status: IdentityStatus;
    name: string;
    index: number;
    network: Network;
    provider: number;
}

export interface PendingIdentity extends BaseIdentity {
    status: IdentityStatus.Pending;
    location: string;
}

export interface RejectedIdentity extends BaseIdentity {
    status: IdentityStatus.Rejected;
    error: string;
}

export interface ConfirmedIdentity extends BaseIdentity {
    status: IdentityStatus.Confirmed;
    idObject: {
        v: 0;
        value: {
            attributeList: Record<string, unknown>;
            preIdentityObject: Record<string, unknown>;
            signature: string;
        };
    };
}

export type Identity = PendingIdentity | RejectedIdentity | ConfirmedIdentity;
