import type {
    AccountTransactionPayload,
    AccountTransactionSignature,
    AccountTransactionType,
} from '@concordium/web-sdk';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type WalletEventHandler<T = any> = (payload: T) => void;

export interface WalletApi {
    addChangeAccountListener(handler: WalletEventHandler<string>): void;
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
    connect(): Promise<string | undefined>;
}
