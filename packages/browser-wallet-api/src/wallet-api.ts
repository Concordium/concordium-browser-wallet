import {
    InjectedMessageHandler,
    createEventTypeFilter,
    MessageType,
    MessageStatusWrapper,
} from '@concordium/browser-wallet-message-hub';
import {
    AccountTransactionPayload,
    AccountTransactionSignature,
    AccountTransactionType,
    DeployModulePayload,
    InitContractPayload,
    SchemaVersion,
    UpdateContractPayload,
} from '@concordium/common-sdk/lib/types';
import { JsonRpcClient } from '@concordium/common-sdk/lib/JsonRpcClient';
import {
    WalletApi as IWalletApi,
    EventType,
    SchemaWithContext,
    SchemaType,
} from '@concordium/browser-wallet-api-helpers';
import EventEmitter from 'events';
import type { JsonRpcRequest } from '@concordium/common-sdk/lib/providers/provider';
import JSONBig from 'json-bigint';
import { IdProofOutput, IdStatement } from '@concordium/common-sdk';
import { stringify } from './util';

type JsonRpcCallResponse =
    | {
          success: true;
          response: string;
      }
    | {
          success: false;
          error: string;
      };

class WalletApi extends EventEmitter implements IWalletApi {
    private messageHandler = new InjectedMessageHandler();

    private jsonRpcClient: JsonRpcClient;

    constructor() {
        super();
        // We pre-serialize the parameters before sending to the background script.
        const request = (...input: Parameters<JsonRpcRequest>) =>
            this.messageHandler
                .sendMessage<JsonRpcCallResponse>(MessageType.JsonRpcRequest, {
                    method: input[0],
                    params: JSONBig.stringify(input[1]),
                })
                .then((result) => {
                    if (!result.success) {
                        throw new Error(result.error);
                    }
                    return result.response;
                });
        this.jsonRpcClient = new JsonRpcClient({ request });

        // Set up message handlers to emit events.
        Object.values(EventType).forEach((eventType) => this.handleEvent(eventType));
    }

    /**
     * Sends a sign request to the Concordium Wallet and awaits the users action
     */
    public async signMessage(accountAddress: string, message: string): Promise<AccountTransactionSignature> {
        const response = await this.messageHandler.sendMessage<MessageStatusWrapper<AccountTransactionSignature>>(
            MessageType.SignMessage,
            {
                accountAddress,
                message,
            }
        );

        if (!response.success) {
            throw new Error('Signing rejected');
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
        accountAddress: string,
        type: AccountTransactionType,
        payload: AccountTransactionPayload,
        parameters?: Record<string, unknown>,
        schema?: string | SchemaWithContext,
        schemaVersion?: SchemaVersion
    ): Promise<string> {
        // This parsing is to temporarily support older versions of the web-SDK, which has different field names.
        let parsedPayload = payload;
        if (type === AccountTransactionType.InitContract) {
            const initPayload: InitContractPayload = {
                ...(payload as InitContractPayload),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                initName: (payload as InitContractPayload).initName || (payload as any).contractName,
            };
            parsedPayload = initPayload;
        } else if (type === AccountTransactionType.Update) {
            const updatePayload: UpdateContractPayload = {
                ...(payload as UpdateContractPayload),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                address: (payload as UpdateContractPayload).address || (payload as any).contractAddress,
            };
            parsedPayload = updatePayload;
        } else if (type === AccountTransactionType.DeployModule) {
            const deployPayload: DeployModulePayload = {
                ...(payload as DeployModulePayload),
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                source: (payload as DeployModulePayload).source || (payload as any).content,
            };
            parsedPayload = deployPayload;
        }
        let parsedSchema: SchemaWithContext | undefined;
        if (typeof schema === 'string' || schema instanceof String) {
            parsedSchema = {
                type: SchemaType.Module,
                value: schema.toString(),
            };
        } else {
            parsedSchema = schema;
        }
        const response = await this.messageHandler.sendMessage<MessageStatusWrapper<string>>(
            MessageType.SendTransaction,
            {
                accountAddress,
                type,
                payload: stringify(parsedPayload),
                parameters,
                schema: parsedSchema,
                schemaVersion,
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

    public getJsonRpcClient(): JsonRpcClient {
        return this.jsonRpcClient;
    }

    public async addCIS2Tokens(
        accountAddress: string,
        tokenIds: string[],
        contractIndex: bigint,
        contractSubindex?: bigint
    ): Promise<string[]> {
        const response = await this.messageHandler.sendMessage<MessageStatusWrapper<string[]>>(MessageType.AddTokens, {
            accountAddress,
            tokenIds,
            contractIndex: contractIndex.toString(),
            contractSubindex: contractSubindex?.toString(),
        });
        if (!response.success) {
            throw new Error(response.message);
        }
        return response.result;
    }

    public async requestIdProof(
        accountAddress: string,
        statement: IdStatement,
        challenge: string
    ): Promise<IdProofOutput> {
        const res = await this.messageHandler.sendMessage<MessageStatusWrapper<IdProofOutput>>(MessageType.IdProof, {
            accountAddress,
            statement,
            challenge,
        });

        if (!res.success) {
            throw new Error(res.message);
        }

        return res.result;
    }
}

export const walletApi = new WalletApi();
