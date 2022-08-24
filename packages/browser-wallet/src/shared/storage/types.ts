import type { IdentityObjectV1, Versioned } from '@concordium/web-sdk';

export enum ChromeStorageKey {
    ConnectedSites = 'connectedSites',
    Credentials = 'credentials',
    NetworkConfiguration = 'networkConfiguration',
    Passcode = 'passcode',
    SeedPhrase = 'seedPhrase',
    SelectedAccount = 'selectedAccount',
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

/**
 * Used to describe the status of an identity or a credential
 */
export enum CreationStatus {
    Pending = 'pending',
    Confirmed = 'confirmed',
    Rejected = 'rejected',
}

export interface BaseIdentity {
    id: number;
    status: CreationStatus;
    name: string;
    index: number;
    network: Network;
    provider: number;
}

export interface PendingIdentity extends BaseIdentity {
    status: CreationStatus.Pending;
    location: string;
}

export interface RejectedIdentity extends BaseIdentity {
    status: CreationStatus.Rejected;
    error: string;
}

export interface ConfirmedIdentity extends BaseIdentity {
    status: CreationStatus.Confirmed;
    idObject: Versioned<IdentityObjectV1>;
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
    recoveryStart: string;
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

export interface BaseCredential {
    address: string;
    credId: string;
    credNumber: number;
    status: CreationStatus;
    identityId: number;
    net: Network;
    // Policy (is in accountInfo)
    // CredentialIndex = 0
}

export interface PendingWalletCredential extends BaseCredential {
    status: CreationStatus.Pending;
    deploymentHash: string;
}
export interface ConfirmedCredential extends BaseCredential {
    status: CreationStatus.Confirmed;
}
export interface RejectedCredential extends BaseCredential {
    status: CreationStatus.Rejected;
}

export type WalletCredential = PendingWalletCredential | ConfirmedCredential | RejectedCredential;

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
