export enum ChromeStorageKey {
    ConnectedSites = 'connectedSites',
    Credentials = 'credentials',
    NetworkConfiguration = 'networkConfiguration',
    Passcode = 'passcode',
    SelectedAccount = 'selectedAccont',
    SeedPhrase = 'seedPhrase',
    Theme = 'theme',
    PendingIdentity = 'pendingIdentity',
    Identities = 'identities',
    SelectedIdentity = 'selectedIdentity',
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

type Hex = string;

/**
 * A description of an entity, used for Identity Provider and Anonymity Revoker
 */
export interface Description {
    name: string;
    url: string;
    description: string;
}

/**
 * Identity Provider information
 */
export interface IpInfo {
    ipIdentity: number;
    ipDescription: Description;
    ipVerifyKey: Hex;
    ipCdiVerifyKey: Hex;
}

/**
 * Structure of the metadata which is provided, about an identityProvider,
 * but is not contained in IpInfo.
 */
export interface IdentityProviderMetaData {
    issuanceStart: string;
    icon: string;
    support: string;
}

/**
 * Anonymity Revoker information
 */
export interface ArInfo {
    arIdentity: number;
    arDescription: Description;
    arPublicKey: Hex;
}

export interface Global {
    onChainCommitmentKey: Hex;
    bulletproofGenerators: Hex;
    genesisString: string;
}

/**
 * Reflects the structure of an Identity Provider.
 */
export interface IdentityProvider {
    ipInfo: IpInfo;
    arsInfos: Record<string, ArInfo>; // objects with ArInfo fields (and numbers as field names)
    metadata: IdentityProviderMetaData;
}

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
