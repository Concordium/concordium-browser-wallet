import type { CryptographicParameters, IdentityObjectV1, Network, Versioned } from '@concordium/web-sdk';

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
    AccountInfoCache = 'accountInfoCache',
    IsRecovering = 'isRecovering',
    IsCreatingCredential = 'IsCreatingCredential',
    HasBeenOnboarded = 'hasBeenOnboarded',
    OnboardingLocation = 'onboardingLocation',
    RecoveryStatus = 'recoveryStatus',
    IdpTab = 'idpTab',
    Tokens = 'tokens',
    TokenMetadata = 'tokenMetadata',
    PendingTransactions = 'pendingTransactions',
    Cookie = 'cookie',
    OpenPrompt = 'openPrompt',
    AcceptedTerms = 'acceptedTerms',
}

export enum Theme {
    Light = 'light',
    Dark = 'dark',
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
    status: CreationStatus;
    name: string;
    index: number;
    providerIndex: number;
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

export type SessionPendingIdentity = {
    identity: Omit<PendingIdentity, 'location'>;
    network: NetworkConfiguration;
};

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
    identityIndex: number;
    providerIndex: number;
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

export type RecoveryPayload = {
    providers: IdentityProvider[];
    globalContext: CryptographicParameters;
    net: Network;
};

export interface CredentialBalancePair {
    cred: WalletCredential;
    balance: string;
}
export interface RecoveryStatus {
    payload: RecoveryPayload;
    identitiesToAdd?: Identity[];
    credentialsToAdd?: CredentialBalancePair[];
    completedProviders?: number[];
    identityIndex?: number;
    identityGap?: number;
    credentialNumber?: number;
    credentialGap?: number;
    nextId?: number;
}

export interface MetadataUrl {
    url: string;
    hash?: string;
}

export interface MetadataAttribute {
    type: string;
    name: string;
    value: string;
}

export interface TokenMetadata {
    name?: string;
    symbol?: string;
    decimals?: number;
    description?: string;
    thumbnail?: MetadataUrl;
    display?: MetadataUrl;
    artifact?: MetadataUrl;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    assets?: any;
    attributes?: MetadataAttribute[];
    unique?: boolean;
    localization?: Record<string, MetadataUrl>;
}

export interface TokenIdAndMetadata {
    id: string;
    metadataLink: string;
    metadata: TokenMetadata;
}

export interface TokenStorage {
    id: string;
    metadataLink: string;
}

export type Cis2TokenResponse = {
    id: number;
    token: string;
    totalSupply: string; // string encoded bigint.
};

export type Cis2TokensResponse = {
    count: number;
    from?: number;
    limit: number;
    tokens: Cis2TokenResponse[];
};

export type AcceptedTermsState = {
    accepted: boolean;
    version: string;
};
