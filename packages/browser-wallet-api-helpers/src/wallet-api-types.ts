import type {
    AccountTransactionPayload,
    AccountTransactionSignature,
    AccountTransactionType,
    InitContractPayload,
    JsonRpcClient,
    SchemaVersion,
    UpdateContractPayload,
    IdStatement,
    IdProofOutput,
    ConcordiumGRPCClient,
} from '@concordium/web-sdk';

export type SendTransactionPayload =
    | Exclude<AccountTransactionPayload, UpdateContractPayload | InitContractPayload>
    | Omit<UpdateContractPayload, 'message'>
    | Omit<InitContractPayload, 'param'>;

export type SmartContractParameters =
    | { [key: string]: SmartContractParameters }
    | SmartContractParameters[]
    | number
    | string
    | boolean;

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
    type: SchemaType;
    value: string;
};

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
     * @param parameters parameters for the initContract and updateContract transactions in JSON-like format.
     * @param schema schema used for the initContract and updateContract transactions to serialize the parameters. Should be base64 encoded.
     * @param schemaVersion version of the schema provided. Must be supplied for schemas that use version 0 or 1, as they don't have the version embedded.
     */
    sendTransaction(
        accountAddress: string,
        type: AccountTransactionType.Update | AccountTransactionType.InitContract,
        payload: SendTransactionPayload,
        parameters: SmartContractParameters,
        schema: string | SchemaWithContext,
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
        accountAddress: string,
        type: AccountTransactionType,
        payload: SendTransactionPayload
    ): Promise<string>;
    /**
     * Sends a message to the Concordium Wallet and awaits the users action. If the user signs the message, this will resolve to the signature.
     * Note that if the user rejects signing the message, this will throw an error.
     * @param accountAddress the address of the account that should sign the message
     * @param message message to be signed. Note that the wallet will prepend some bytes to ensure the message cannot be a transaction
     */
    signMessage(accountAddress: string, message: string): Promise<AccountTransactionSignature>;
    /**
     * Requests a connection to the Concordium wallet, prompting the user to either accept or reject the request.
     * If a connection has already been accepted for the url once the returned promise will resolve without prompting the user.
     */
    connect(): Promise<string | undefined>;

    /**
     * Returns some connected account, prioritizing the most recently selected. Resolves with account address or undefined if there are no connected account.
     */
    getMostRecentlySelectedAccount(): Promise<string | undefined>;

    removeAllListeners(event?: EventType | string | undefined): this;

    /**
     * @deprecated use { @link getGrpcClient} instead
     */
    getJsonRpcClient(): JsonRpcClient;

    /**
     * Returns a gRPC client that is connected to the node that the wallet is.
     * Note that any calls will throw an error, if the site is not connected with the wallet.
     */
    getGrpcClient(): ConcordiumGRPCClient;
    /**
     * Returns the genesis hash of the currently selected chain in the wallet.
     * Returns undefined if the wallet is either locked or not set up by the user.
     */
    getSelectedChain(): Promise<string | undefined>;

    /**
     * Request that the user adds the specified tokens for a given contract to the wallet.
     * Returns which of the given tokens the user accepted to add the tokens into the wallet.
     * Note that this will throw an error if the dApp is not connected with the accountAddress.
     * @param accountAddress the address of the account whose display the tokens should be added to.
     * @param tokenIds the list of ids, for the tokens that should be added.
     * @param contractIndex the index of the CIS-2 contract which the tokens are in.
     * @param contractSubindex the subindex of the CIS-2 contract which the tokens are in.
     * @returns a list containing the ids of the tokens that was added to the wallet.
     */
    addCIS2Tokens(
        accountAddress: string,
        tokenIds: string[],
        contractIndex: bigint,
        contractSubindex?: bigint
    ): Promise<string[]>;

    /**
     * Request that the user provides a proof for the given statement.
     * @param accountAddress the address of the account that should prove the statement.
     * @param statement the id statement that should be proven.
     * @param challenge bytes chosen by the verifier. Should be HEX encoded.
     * @returns The id proof and the id of the credential used to prove it.
     */
    requestIdProof(accountAddress: string, statement: IdStatement, challenge: string): Promise<IdProofOutput>;
}

export type WalletApi = MainWalletApi & EventListeners;
