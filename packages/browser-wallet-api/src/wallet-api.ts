import {
    InjectedMessageHandler,
    createEventTypeFilter,
    MessageType,
    MessageStatusWrapper,
} from '@concordium/browser-wallet-message-hub';
import {
    AccountAddress,
    AccountTransactionPayload,
    AccountTransactionSignature,
    AccountTransactionType,
    HexString,
    SchemaVersion,
    ContractAddress,
    VerifiablePresentation,
} from '@concordium/web-sdk/types';
import {
    WalletApi as IWalletApi,
    EventType,
    SignMessageObject,
    SmartContractParameters,
    APIVerifiableCredential,
    MetadataUrl,
    CredentialProof,
    AccountAddressSource,
    SchemaSource,
} from '@concordium/browser-wallet-api-helpers';
import EventEmitter from 'events';
import { IdProofOutput, IdStatement } from '@concordium/web-sdk/id';
import { CredentialStatements } from '@concordium/web-sdk/web3-id';
import { ConcordiumGRPCClient } from '@concordium/web-sdk-legacy';
import { RpcTransport } from '@protobuf-ts/runtime-rpc';
import { stringify } from './util';
import { BWGRPCTransport } from './gRPC-transport';
import {
    sanitizeAddCIS2TokensInput,
    sanitizeRequestIdProofInput,
    sanitizeSendTransactionInput,
    sanitizeSignMessageInput,
} from './compatibility';

class WalletApi extends EventEmitter implements IWalletApi {
    private messageHandler = new InjectedMessageHandler();

    private grpcClient: ConcordiumGRPCClient;

    private bwgrpcTransport: RpcTransport;

    constructor() {
        super();
        this.bwgrpcTransport = new BWGRPCTransport(this.messageHandler);
        this.grpcClient = new ConcordiumGRPCClient(this.bwgrpcTransport);

        // Set up message handlers to emit events.
        Object.values(EventType).forEach((eventType) => this.handleEvent(eventType));
    }

    /**
     * Sends a sign request to the Concordium Wallet and awaits the users action
     */
    public async signMessage(
        accountAddress: AccountAddressSource,
        message: string | SignMessageObject
    ): Promise<AccountTransactionSignature> {
        const input = sanitizeSignMessageInput(accountAddress, message);
        const response = await this.messageHandler.sendMessage<MessageStatusWrapper<AccountTransactionSignature>>(
            MessageType.SignMessage,
            {
                ...input,
                accountAddress: AccountAddress.toBase58(input.accountAddress),
            }
        );

        if (!response.success) {
            throw new Error(response.message);
        }

        return response.result;
    }

    /**
     * Requests connection to wallet. Resolves with account address or rejects if rejected in wallet.
     */
    public async connect(): Promise<string | undefined> {
        const response = await this.messageHandler.sendMessage<MessageStatusWrapper<string>>(MessageType.Connect);

        if (!response.success) {
            throw new Error(response.message);
        }

        return response.result;
    }

    /**
     * Request a connection to the wallet. Resolves with a list of accounts that the user has accepted
     * to connect with. The list of accounts may be empty. It rejects if the request is rejected or closed
     * by the user in the wallet.
     */
    public async requestAccounts(): Promise<string[]> {
        const response = await this.messageHandler.sendMessage<MessageStatusWrapper<string[]>>(
            MessageType.ConnectAccounts
        );
        if (!response.success) {
            throw new Error(response.message);
        }

        return response.result;
    }

    /**
     * Returns some connected account, prioritizing the most recently selected. Resolves with account address or undefined if there are no connected account.
     */
    public async getMostRecentlySelectedAccount(): Promise<string | undefined> {
        const response = await this.messageHandler.sendMessage<string | null>(MessageType.GetSelectedAccount);

        // TODO Response becomes === null when we would expect it to be undefined. Catching it here is a temporary quick-fix.
        if (response === null) {
            return undefined;
        }
        return response;
    }

    /**
     * Sends a transaction to the Concordium Wallet and awaits the users action
     */
    public async sendTransaction(
        accountAddress: AccountAddressSource,
        type: AccountTransactionType,
        payload: AccountTransactionPayload,
        parameters?: SmartContractParameters,
        schema?: SchemaSource,
        schemaVersion?: SchemaVersion
    ): Promise<string> {
        const input = sanitizeSendTransactionInput(accountAddress, type, payload, parameters, schema, schemaVersion);
        const response = await this.messageHandler.sendMessage<MessageStatusWrapper<string>>(
            MessageType.SendTransaction,
            {
                ...input,
                accountAddress: AccountAddress.toBase58(input.accountAddress),
                payload: stringify(input.payload),
            }
        );

        if (!response.success) {
            throw new Error(response.message);
        }

        return response.result;
    }

    private handleEvent(type: EventType) {
        this.messageHandler.handleMessage(createEventTypeFilter(type), (msg) => this.emit(type, msg.payload));
    }

    /**
     * @deprecated the GRPC client version exposed by the wallet API will not be updated and should not be used.
     * This is due to not being able to ensure compatibility between the API expected by a web application and
     * the GRPC client injected into the application context.
     *
     * Instead, the exposed {@linkcode grpcTransport} can be used to to construct a GRPC client.
     */
    public getGrpcClient(): ConcordiumGRPCClient {
        return this.grpcClient;
    }

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
    public get grpcTransport(): RpcTransport {
        return this.bwgrpcTransport;
    }

    public async getSelectedChain(): Promise<string | undefined> {
        const response = await this.messageHandler.sendMessage<string | null>(MessageType.GetSelectedChain);

        // TODO Response becomes === null when we would expect it to be undefined. Catching it here is a temporary quick-fix.
        if (response === null) {
            return undefined;
        }
        return response;
    }

    public async addCIS2Tokens(
        accountAddress: AccountAddressSource,
        tokenIds: string[],
        contractAddressSource: ContractAddress.Type | bigint,
        contractSubindex?: bigint
    ): Promise<string[]> {
        const input = sanitizeAddCIS2TokensInput(accountAddress, tokenIds, contractAddressSource, contractSubindex);
        const response = await this.messageHandler.sendMessage<MessageStatusWrapper<string[]>>(MessageType.AddTokens, {
            ...input,
            accountAddress: AccountAddress.toBase58(input.accountAddress),
            contractAddress: ContractAddress.toSerializable(input.contractAddress),
        });
        if (!response.success) {
            throw new Error(response.message);
        }
        return response.result;
    }

    public async requestIdProof(
        accountAddress: AccountAddressSource,
        statement: IdStatement,
        challenge: string
    ): Promise<IdProofOutput> {
        const input = sanitizeRequestIdProofInput(accountAddress, statement, challenge);
        const res = await this.messageHandler.sendMessage<MessageStatusWrapper<IdProofOutput>>(MessageType.IdProof, {
            ...input,
            accountAddress: AccountAddress.toBase58(input.accountAddress),
        });

        if (!res.success) {
            throw new Error(res.message);
        }

        return res.result;
    }

    public async addWeb3IdCredential(
        credential: APIVerifiableCredential,
        metadataUrl: MetadataUrl,
        generateProofAndRandomness: (
            credentialHolderIdDID: string
        ) => Promise<{ randomness: Record<string, string>; proof: CredentialProof }>
    ): Promise<string> {
        const res = await this.messageHandler.sendMessage<MessageStatusWrapper<string>>(
            MessageType.AddWeb3IdCredential,
            {
                credential: stringify(credential),
                metadataUrl,
            }
        );

        if (!res.success) {
            throw new Error(res.message);
        }

        const credentialHolderIdDID = res.result;

        const { proof, randomness } = await generateProofAndRandomness(credentialHolderIdDID);

        const saveSignatureResult = await this.messageHandler.sendMessage<MessageStatusWrapper<void>>(
            MessageType.AddWeb3IdCredentialFinish,
            {
                credentialHolderIdDID,
                proof,
                randomness,
            }
        );

        if (!saveSignatureResult.success) {
            throw new Error(saveSignatureResult.message);
        }

        return credentialHolderIdDID;
    }

    public async requestVerifiablePresentation(challenge: HexString, statements: CredentialStatements) {
        if (statements === undefined || statements.length === 0) {
            throw new Error('A request for a verifiable presentation must contain statements');
        }

        const res = await this.messageHandler.sendMessage<MessageStatusWrapper<string>>(MessageType.Web3IdProof, {
            // We have to stringify the statements because they can contain bigints
            statements: stringify(statements),
            challenge,
        });

        if (!res.success) {
            throw new Error(res.message);
        }

        return VerifiablePresentation.fromString(res.result);
    }
}

export const walletApi = new WalletApi();
