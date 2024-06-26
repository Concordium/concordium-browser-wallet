import type {
    AccountTransactionPayload,
    AccountTransactionSignature,
    AccountTransactionType,
    InitContractPayload,
    SchemaVersion,
    UpdateContractPayload,
    IdStatement,
    IdProofOutput,
    CredentialStatements,
    VerifiablePresentation,
    CredentialSubject,
    HexString,
    AccountAddress,
    Base58String,
    Base64String,
    ContractAddress,
    UpdateCredentialsPayload,
    RegisterDataPayload,
    SimpleTransferPayload,
    SimpleTransferWithMemoPayload,
    DeployModulePayload,
    ConfigureBakerPayload,
    ConfigureDelegationPayload,
    ContractName,
    EntrypointName,
} from '@concordium/web-sdk';
import type { RpcTransport } from '@protobuf-ts/runtime-rpc';
import { LaxNumberEnumValue, LaxStringEnumValue } from './util';

export interface MetadataUrl {
    url: string;
    hash?: string;
}

interface CredentialSchema {
    id: string;
    type: string;
}

/**
 * The expected form of a Web3IdCredential, with the id fields omitted.
 */
export interface APIVerifiableCredential {
    $schema: string;
    type: string[];
    issuer: string;
    issuanceDate: string;
    credentialSubject: Omit<CredentialSubject, 'id'>;
    credentialSchema: CredentialSchema;
}

/**
 * Expected format for the proof that the Web3IdCredential's attribute commitments are valid
 */
export interface CredentialProof {
    proofPurpose: 'assertionMethod';
    proofValue: HexString;
    type: 'Ed25519Signature2020';
    verificationMethod: string;
}

export type SendTransactionUpdateContractPayload = Omit<UpdateContractPayload, 'message'>;
export type SendTransactionInitContractPayload = Omit<InitContractPayload, 'param'>;

export type SendTransactionPayload =
    | Exclude<AccountTransactionPayload, UpdateContractPayload | InitContractPayload>
    | SendTransactionUpdateContractPayload
    | SendTransactionInitContractPayload;

export type SmartContractParameters =
    | { [key: string]: SmartContractParameters }
    | SmartContractParameters[]
    | number
    | bigint
    | string
    | boolean;

export type SignMessageObject = {
    /** as base64 */
    schema: string;
    /** as hex */
    data: string;
};

/**
 * An enumeration of the events that can be emitted by the WalletApi.
 */
export enum EventType {
    AccountChanged = 'accountChanged',
    AccountDisconnected = 'accountDisconnected',
    ChainChanged = 'chainChanged',
}

export enum SchemaType {
    Module = 'module',
    Parameter = 'parameter',
}

export type SchemaWithContext = {
    type: LaxStringEnumValue<SchemaType>;
    value: string;
};

export type AccountAddressSource = Base58String | AccountAddress.Type;
export type SchemaSource = Base64String | SchemaWithContext;

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
type EventListener<Args extends any[]> = (...args: Args) => void;

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
interface Listeners<T extends EventType, Args extends any[]> {
    on(eventName: T | `${T}`, listener: EventListener<Args>): this;
    once(eventName: T | `${T}`, listener: EventListener<Args>): this;
    addListener(eventName: T | `${T}`, listener: EventListener<Args>): this;
    removeListener(eventName: T | `${T}`, listener: EventListener<Args>): this;
}

type EventListeners = Listeners<EventType.AccountChanged, [accountAddress: string]> &
    Listeners<EventType.ChainChanged, [chain: string]> &
    Listeners<EventType.AccountDisconnected, [accountAddress: string]>;

interface MainWalletApi {
    /**
     * Sends a transaction to the Concordium Wallet and awaits the users action. Note that a header is not sent, and will be constructed by the wallet itself.
     * Note that if the user rejects signing the transaction, this will throw an error.
     * @param accountAddress the address of the account that should sign the transaction
     * @param type the type of transaction that is to be signed and sent.
     * @param payload the payload of the transaction to be signed and sent. Note that for smart contract transactions, the payload should not contain the params/message fields, those should instead be provided in the subsequent argument instead.
     * @param [parameters] parameters for the initContract and updateContract transactions in JSON-like format.
     * @param [schema] schema used for the initContract and updateContract transactions to serialize the parameters. Should be base64 encoded.
     * @param [schemaVersion] version of the schema provided. Must be supplied for schemas that use version 0 or 1, as they don't have the version embedded.
     */
    sendTransaction(
        accountAddress: AccountAddressSource,
        type: LaxNumberEnumValue<AccountTransactionType.InitContract>,
        payload: SendTransactionInitContractPayload,
        parameters?: SmartContractParameters,
        schema?: SchemaSource,
        schemaVersion?: SchemaVersion
    ): Promise<string>;
    /**
     * Sends a transaction to the Concordium Wallet and awaits the users action. Note that a header is not sent, and will be constructed by the wallet itself.
     * Note that if the user rejects signing the transaction, this will throw an error.
     * @param accountAddress the address of the account that should sign the transaction
     * @param type the type of transaction that is to be signed and sent.
     * @param payload the payload of the transaction to be signed and sent. Note that for smart contract transactions, the payload should not contain the params/message fields, those should instead be provided in the subsequent argument instead.
     * @param [parameters] parameters for the initContract and updateContract transactions in JSON-like format.
     * @param [schema] schema used for the initContract and updateContract transactions to serialize the parameters. Should be base64 encoded.
     * @param [schemaVersion] version of the schema provided. Must be supplied for schemas that use version 0 or 1, as they don't have the version embedded.
     */
    sendTransaction(
        accountAddress: AccountAddressSource,
        type: LaxNumberEnumValue<AccountTransactionType.Update>,
        payload: SendTransactionUpdateContractPayload,
        parameters?: SmartContractParameters,
        schema?: SchemaSource,
        schemaVersion?: SchemaVersion
    ): Promise<string>;
    /**
     * Sends a transaction to the Concordium Wallet and awaits the users action. Note that a header is not sent, and will be constructed by the wallet itself.
     * Note that if the user rejects signing the transaction, this will throw an error.
     * @param accountAddress the address of the account that should sign the transaction
     * @param type the type of transaction that is to be signed and sent.
     * @param payload the payload of the transaction to be signed and sent. Note that for smart contract transactions, the payload should not contain the parameters, those should instead be provided in the subsequent argument instead.
     */
    sendTransaction(
        accountAddress: AccountAddressSource,
        type: LaxNumberEnumValue<AccountTransactionType.UpdateCredentials>,
        payload: UpdateCredentialsPayload
    ): Promise<string>;
    /**
     * Sends a transaction to the Concordium Wallet and awaits the users action. Note that a header is not sent, and will be constructed by the wallet itself.
     * Note that if the user rejects signing the transaction, this will throw an error.
     * @param accountAddress the address of the account that should sign the transaction
     * @param type the type of transaction that is to be signed and sent.
     * @param payload the payload of the transaction to be signed and sent. Note that for smart contract transactions, the payload should not contain the parameters, those should instead be provided in the subsequent argument instead.
     */
    sendTransaction(
        accountAddress: AccountAddressSource,
        type: LaxNumberEnumValue<AccountTransactionType.RegisterData>,
        payload: RegisterDataPayload
    ): Promise<string>;
    /**
     * Sends a transaction to the Concordium Wallet and awaits the users action. Note that a header is not sent, and will be constructed by the wallet itself.
     * Note that if the user rejects signing the transaction, this will throw an error.
     * @param accountAddress the address of the account that should sign the transaction
     * @param type the type of transaction that is to be signed and sent.
     * @param payload the payload of the transaction to be signed and sent. Note that for smart contract transactions, the payload should not contain the parameters, those should instead be provided in the subsequent argument instead.
     */
    sendTransaction(
        accountAddress: AccountAddressSource,
        type: LaxNumberEnumValue<AccountTransactionType.Transfer>,
        payload: SimpleTransferPayload
    ): Promise<string>;
    /**
     * Sends a transaction to the Concordium Wallet and awaits the users action. Note that a header is not sent, and will be constructed by the wallet itself.
     * Note that if the user rejects signing the transaction, this will throw an error.
     * @param accountAddress the address of the account that should sign the transaction
     * @param type the type of transaction that is to be signed and sent.
     * @param payload the payload of the transaction to be signed and sent. Note that for smart contract transactions, the payload should not contain the parameters, those should instead be provided in the subsequent argument instead.
     */
    sendTransaction(
        accountAddress: AccountAddressSource,
        type: LaxNumberEnumValue<AccountTransactionType.TransferWithMemo>,
        payload: SimpleTransferWithMemoPayload
    ): Promise<string>;
    /**
     * Sends a transaction to the Concordium Wallet and awaits the users action. Note that a header is not sent, and will be constructed by the wallet itself.
     * Note that if the user rejects signing the transaction, this will throw an error.
     * @param accountAddress the address of the account that should sign the transaction
     * @param type the type of transaction that is to be signed and sent.
     * @param payload the payload of the transaction to be signed and sent. Note that for smart contract transactions, the payload should not contain the parameters, those should instead be provided in the subsequent argument instead.
     */
    sendTransaction(
        accountAddress: AccountAddressSource,
        type: LaxNumberEnumValue<AccountTransactionType.DeployModule>,
        payload: DeployModulePayload
    ): Promise<string>;
    /**
     * Sends a transaction to the Concordium Wallet and awaits the users action. Note that a header is not sent, and will be constructed by the wallet itself.
     * Note that if the user rejects signing the transaction, this will throw an error.
     * @param accountAddress the address of the account that should sign the transaction
     * @param type the type of transaction that is to be signed and sent.
     * @param payload the payload of the transaction to be signed and sent. Note that for smart contract transactions, the payload should not contain the parameters, those should instead be provided in the subsequent argument instead.
     */
    sendTransaction(
        accountAddress: AccountAddressSource,
        type: LaxNumberEnumValue<AccountTransactionType.ConfigureBaker>,
        payload: ConfigureBakerPayload
    ): Promise<string>;
    /**
     * Sends a transaction to the Concordium Wallet and awaits the users action. Note that a header is not sent, and will be constructed by the wallet itself.
     * Note that if the user rejects signing the transaction, this will throw an error.
     * @param accountAddress the address of the account that should sign the transaction
     * @param type the type of transaction that is to be signed and sent.
     * @param payload the payload of the transaction to be signed and sent. Note that for smart contract transactions, the payload should not contain the parameters, those should instead be provided in the subsequent argument instead.
     */
    sendTransaction(
        accountAddress: AccountAddressSource,
        type: LaxNumberEnumValue<AccountTransactionType.ConfigureDelegation>,
        payload: ConfigureDelegationPayload
    ): Promise<string>;
    /**
     * Sends a message to the Concordium Wallet and awaits the users action. If the user signs the message, this will resolve to the signature.
     * Note that if the user rejects signing the message, this will throw an error.
     * @param accountAddress the address of the account that should sign the message
     * @param message message to be signed. Note that the wallet will prepend some bytes to ensure the message cannot be a transaction. The message should either be a utf8 string or { @link SignMessageObject }.
     */
    signMessage(
        accountAddress: AccountAddressSource,
        message: string | SignMessageObject
    ): Promise<AccountTransactionSignature>;

    /**
     * Sends a message of the CIS3 contract standard, to the Concordium Wallet and awaits the users action. If the user signs the message, this will resolve to the signature.
     *
     * @param contractAddress the {@link ContractAddress} of the contract
     * @param contractName the {@link ContractName} of the contract
     * @param entrypointName the {@link EntrypointName} of the contract
     * @param nonce the nonce (CIS3 standard) that was part of the message that was signed
     * @param expiryTimeSignature RFC 3339 format (e.g. 2030-08-08T05:15:00Z)
     * @param accountAddress the address of the account that should sign the message
     * @param payloadMessage payload message to be signed, complete CIS3 message will be created from provided parameters. Note that the wallet will prepend some bytes to ensure the message cannot be a transaction. The message should be { @link SignMessageObject }.
     *
     * @throws if the user rejects signing the message.
     */
    signCIS3Message(
        contractAddress: ContractAddress.Type,
        contractName: ContractName.Type,
        entrypointName: EntrypointName.Type,
        nonce: bigint | number,
        expiryTimeSignature: string,
        accountAddress: AccountAddressSource,
        payloadMessage: SignMessageObject
    ): Promise<AccountTransactionSignature>;

    /**
     * Requests a connection to the Concordium wallet, prompting the user to either accept or reject the request.
     * If a connection has already been accepted for the url once the returned promise will resolve without prompting the user.
     * @deprecated use {@link requestAccounts} instead
     */
    connect(): Promise<string | undefined>;

    /**
     * Requests a connection to the Concordium wallet, prompting the user to either accept or reject the request. The
     * user will be prompted to select which accounts should be connected. The list of connected accounts is returned
     * to the caller. If a connection has already been accepted previously, then the returned promise will resolve
     * with the list of connected accounts. Note that the list of accounts may be empty.
     *
     * @throws If connection is rejected by the user
     *
     * @returns {string[]} The list of accounts connected to the application.
     */
    requestAccounts(): Promise<string[]>;

    /**
     * Returns some connected account, prioritizing the most recently selected. Resolves with account address or undefined if there are no connected account.
     */
    getMostRecentlySelectedAccount(): Promise<string | undefined>;

    removeAllListeners(event?: EventType | string | undefined): this;

    /**
     * A GRPC transport layer which uses the node used in the wallet to communicate with the selected chain.
     *
     * @example
     * import { ConcordiumGRPCClient } from '@concordium/web-sdk/grpc';
     * import { detectConcordiumProvider } from '@concordium/browser-wallet-api-helpers';
     *
     * const walletApi = await detectConcordiumProvider();
     * const grpcClient = new ConcordiumGRPCClient(await walletApi.grpcTransport);
     */
    get grpcTransport(): RpcTransport;

    /**
     * Returns the genesis hash of the currently selected chain in the wallet.
     * Returns undefined if the wallet is either locked or not set up by the user.
     */
    getSelectedChain(): Promise<string | undefined>;

    /**
     * Request that the user adds the specified tokens for a given contract to the wallet.
     * Returns which of the given tokens the user accepted to add the tokens into the wallet.
     * Note that this will throw an error if the dApp is not connected with the accountAddress.
     * @param accountAddress the {@linkcode AccountAddressSource} of the account whose display the tokens should be added to.
     * @param tokenIds the list of ids, for the tokens that should be added.
     * @param contractAddress the {@link ContractAddress} of the contract
     * @returns a list containing the ids of the tokens that were added to the wallet.
     */
    addCIS2Tokens(
        accountAddress: AccountAddressSource,
        tokenIds: string[],
        contractAddress: ContractAddress.Type
    ): Promise<string[]>;

    /**
     * Request that the user provides a proof for the given statement.
     * @deprecated Please use { @link requestVerifiablePresentation} instead.
     * @param accountAddress the address of the account that should prove the statement.
     * @param statement the id statement that should be proven.
     * @param challenge bytes chosen by the verifier. Should be HEX encoded.
     * @returns The id proof and the id of the credential used to prove it.
     */
    requestIdProof(
        accountAddress: AccountAddressSource,
        statement: IdStatement,
        challenge: string
    ): Promise<IdProofOutput>;

    /**
     * Requests that a web3IdCredential is added to the wallet.
     * Note that this will throw an error if the dApp is not allowlisted, locked, or if the user rejects adding the credential.
     * @param credential the web3IdCredential that should be added to the wallet
     * @param metadataUrl the url where the metadata, to display the credential, is located.
     * @param createSignature a callback function, which takes a DID identifier for the credentialHolderId as input and must return the randomness used for the commitment of the values and signature on the commitments and credentialId.
     * @returns the DID identifier for the credentialHolderId, i.e. the publicKey that will be associated with the credential.
     */
    addWeb3IdCredential(
        credential: APIVerifiableCredential,
        metadataUrl: MetadataUrl,
        generateProofAndRandomness: (
            credentialHolderIdDID: string
        ) => Promise<{ randomness: Record<string, string>; proof: CredentialProof }>
    ): Promise<string>;

    /**
     * Request that the user provides a proof for the given statements.
     * @param challenge bytes chosen by the verifier. Should be HEX encoded.
     * @param statements the web3Id statements that should be proven. The promise rejects if the array of statements is empty.
     * @returns The presentation for the statements.
     */
    requestVerifiablePresentation(challenge: string, statements: CredentialStatements): Promise<VerifiablePresentation>;
}

export type WalletApi = MainWalletApi & EventListeners;
