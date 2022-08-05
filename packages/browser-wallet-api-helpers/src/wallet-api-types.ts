import type {
    AccountTransactionPayload,
    AccountTransactionSignature,
    AccountTransactionType,
    JsonRpcClient,
} from '@concordium/web-sdk';

/**
 * An enumeration of the events that can be emitted by the WalletApi.
 */
export enum EventType {
    AccountChanged = 'accountChanged',
    ChainChanged = 'chainChanged',
}

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
    Listeners<EventType.ChainChanged, [chain: string]>;

interface MainWalletApi {
    /**
     * Sends a transaction to the Concordium Wallet and awaits the users action. Note that a header is not sent, and will be constructed by the wallet itself.
     * Note that if the user rejects signing the transaction, this will throw an error.
     * @param type the type of transaction that is to be signed and sent.
     * @param payload the payload of the transaction to be signed and sent.
     * @param parameters parameters for the initContract and updateContract transactions in JSON-like format.
     * @param schema schema used for the initContract and updateContract transactions to serialize the parameters. Should be base64 encoded.
     */
    sendTransaction(
        type:
            | AccountTransactionType.UpdateSmartContractInstance
            | AccountTransactionType.InitializeSmartContractInstance,
        payload: AccountTransactionPayload,
        parameters: Record<string, unknown>,
        schema: string
    ): Promise<string>;
    /**
     * Sends a transaction to the Concordium Wallet and awaits the users action. Note that a header is not sent, and will be constructed by the wallet itself.
     * Note that if the user rejects signing the transaction, this will throw an error.
     * @param type the type of transaction that is to be signed and sent.
     * @param payload the payload of the transaction to be signed and sent.
     */
    sendTransaction(type: AccountTransactionType, payload: AccountTransactionPayload): Promise<string>;
    /**
     * Sends a message to the Concordium Wallet and awaits the users action. If the user signs the message, this will resolve to the signature.
     * Note that if the user rejects signing the message, this will throw an error.
     * @param message message to be signed. Note that the wallet will prepend some bytes to ensure the message cannot be a transaction
     */
    signMessage(message: string): Promise<AccountTransactionSignature>;
    /**
     * Requests a connection to the Concordium wallet, prompting the user to either accept or reject the request.
     * If a connection has already been accepted for the url once the returned promise will resolve without prompting the user.
     */
    connect(): Promise<string | undefined>;

    removeAllListeners(event?: EventType | string | undefined): this;

    node: JsonRpcClient;
}

export type WalletApi = MainWalletApi & EventListeners;
