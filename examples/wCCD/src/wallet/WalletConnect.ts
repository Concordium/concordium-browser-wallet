// eslint-disable-next-line max-classes-per-file
import SignClient from '@walletconnect/sign-client';
import QRCodeModal from '@walletconnect/qrcode-modal';
import { SessionTypes, SignClientTypes } from '@walletconnect/types';
import {
    AccountTransactionPayload,
    AccountTransactionSignature,
    AccountTransactionType,
    CcdAmount,
    HttpProvider,
    InitContractPayload,
    JsonRpcClient,
    SchemaVersion,
    serializeInitContractParameters,
    serializeUpdateContractParameters,
    toBuffer,
    UpdateContractPayload,
} from '@concordium/web-sdk';
import { Events, Network, WalletConnection, WalletConnector } from './WalletConnection';

const WALLET_CONNECT_SESSION_NAMESPACE = 'ccd';

async function connect(client: SignClient, chainId: string, setModalOpen: (val: boolean) => void) {
    try {
        const { uri, approval } = await client.connect({
            requiredNamespaces: {
                ccd: {
                    methods: ['sign_and_send_transaction'],
                    chains: [chainId],
                    events: ['chain_changed', 'accounts_changed'],
                },
            },
        });

        // Open QRCode modal if a URI was returned (i.e. we're not connecting an existing pairing).
        if (uri) {
            setModalOpen(true);
            QRCodeModal.open(uri, () => {
                setModalOpen(false);
            });
        }

        // Await session approval from the wallet.
        return await approval();
    } finally {
        // Close the QRCode modal in case it was open.
        QRCodeModal.close();
    }
}

interface SignAndSendTransactionResult {
    hash: string;
}

interface SignAndSendTransactionError {
    code: number;
    message: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isSignAndSendTransactionError(obj: any): obj is SignAndSendTransactionError {
    return 'code' in obj && 'message' in obj;
}

function accountTransactionPayloadToJson(data: AccountTransactionPayload) {
    return JSON.stringify(data, (key, value) => {
        if (value instanceof CcdAmount) {
            return value.microCcdAmount.toString();
        }
        if (value?.type === 'Buffer') {
            // Buffer has already been transformed by its 'toJSON' method.
            return toBuffer(value.data).toString('hex');
        }
        if (typeof value === 'bigint') {
            return Number(value);
        }
        return value;
    });
}

export class WalletConnectConnection implements WalletConnection {
    readonly client: SignClient;

    readonly rpcClient: JsonRpcClient;

    readonly chainId: string;

    readonly session: SessionTypes.Struct;

    constructor(client: SignClient, rpcClient: JsonRpcClient, chainId: string, session: SessionTypes.Struct) {
        this.client = client;
        this.rpcClient = rpcClient;
        this.chainId = chainId;
        this.session = session;
    }

    getJsonRpcClient(): JsonRpcClient {
        return this.rpcClient;
    }

    async signAndSendTransaction(
        accountAddress: string,
        type: AccountTransactionType,
        payload: AccountTransactionPayload,
        parameters?: Record<string, unknown>,
        schema?: string,
        schemaVersion?: SchemaVersion
    ) {
        if (type === AccountTransactionType.InitContract) {
            if (parameters === undefined) {
                throw new Error(`parameters provided for 'InitContract' transaction must be not undefined`);
            }
            if (schema === undefined) {
                throw new Error(`schema provided for 'InitContract' transaction must be not undefined`);
            }
            // Encode parameters into 'payload.param' which must be not already present.
            const initContractPayload = payload as InitContractPayload;
            if (initContractPayload.param !== undefined) {
                throw new Error(`'param' field of 'InitContract' parameters must be undefined`);
            }
            // eslint-disable-next-line no-param-reassign
            payload = {
                ...payload,
                param: serializeInitContractParameters(
                    initContractPayload.initName,
                    parameters,
                    toBuffer(schema, 'base64'),
                    schemaVersion
                ),
            };
        }
        if (type === AccountTransactionType.Update) {
            if (parameters === undefined) {
                throw new Error(`parameters provided for 'Update' transaction must be not undefined`);
            }
            if (schema === undefined) {
                throw new Error(`schema provided for 'Update' transaction must be not undefined`);
            }
            // Encode parameters into 'payload.message' which must be not already present.
            const updateContractPayload = payload as UpdateContractPayload;
            if (updateContractPayload.message !== undefined) {
                throw new Error(`'param' field of 'Update' parameters must be undefined`);
            }
            const [contractName, receiveName] = updateContractPayload.receiveName.split('.');
            // eslint-disable-next-line no-param-reassign
            payload = {
                ...payload,
                message: serializeUpdateContractParameters(
                    contractName,
                    receiveName,
                    parameters,
                    toBuffer(schema, 'base64'),
                    schemaVersion
                ),
            };
        }
        const params = {
            type,
            sender: accountAddress,
            payload: accountTransactionPayloadToJson(payload),
            schema,
        };
        try {
            const { hash } = (await this.client.request({
                topic: this.session.topic,
                request: {
                    method: 'sign_and_send_transaction',
                    params,
                },
                chainId: this.chainId,
            })) as SignAndSendTransactionResult;
            return hash;
        } catch (e) {
            if (isSignAndSendTransactionError(e) && e.code === 500) {
                throw new Error('transaction rejected in wallet');
            }
            throw e;
        }
    }

    signMessage(accountAddress: string, message: string): Promise<AccountTransactionSignature> {
        throw new Error('not yet implemented');
    }

    async disconnect() {
        return this.client.disconnect({
            topic: this.session.topic,
            reason: {
                code: 1,
                message: 'user disconnecting',
            },
        });
    }
}

function resolveAccount(session: SessionTypes.Struct) {
    const fullAddress = session.namespaces[WALLET_CONNECT_SESSION_NAMESPACE].accounts[0];
    return fullAddress.substring(fullAddress.lastIndexOf(':') + 1);
}

export class WalletConnectConnector implements WalletConnector {
    readonly client: SignClient;

    readonly network: Network;

    isModalOpen = false;

    constructor(client: SignClient, network: Network) {
        this.client = client;
        this.network = network;
    }

    static async create(signClientInitOpts: SignClientTypes.Options, network: Network) {
        const client = await SignClient.init(signClientInitOpts);
        return new WalletConnectConnector(client, network);
    }

    async connect(events: Events) {
        const chainId = `${WALLET_CONNECT_SESSION_NAMESPACE}:${this.network.name}`;
        const session = await connect(this.client, chainId, (v) => {
            this.isModalOpen = v;
        });
        events.onAccountChanged(resolveAccount(session));

        // Register event handlers (from official docs).
        this.client.on('session_event', ({ topic, params: { chainId: cid, event }, id }) => {
            // Handle session events, such as "chainChanged", "accountsChanged", etc.
            // eslint-disable-next-line no-console
            console.debug('Wallet Connect event: session_event', { topic, id, chainId: cid, event });
            switch (event.name) {
                case 'chanChanged':
                    events.onChainChanged(event.data); // TODO implement correctly
                    break;
                case 'accountsChanged':
                    events.onAccountChanged(event.data); // TODO implement correctly
                    break;
                default:
                    // eslint-disable-next-line no-console
                    console.error(`Unsupported event: ${event.name}`);
            }
        });
        // this.client.on('session_update', ({ topic, params }) => {
        //     const { namespaces } = params;
        //     // Overwrite the `namespaces` of the existing session with the incoming one.
        //     const updatedSession = { ...session, namespaces };
        //     // Integrate the updated session state into your dapp state.
        //     // eslint-disable-next-line no-console
        //     console.debug('Wallet Connect event: session_update', { topic, updatedSession });
        // });
        this.client.on('session_delete', () => {
            // Session was deleted -> reset the dapp state, clean up from user session, etc.
            // eslint-disable-next-line no-console
            console.debug('Wallet Connect event: session_delete');
            events.onDisconnect();
        });

        const rpcClient = new JsonRpcClient(new HttpProvider(this.network.jsonRpcUrl));
        return new WalletConnectConnection(this.client, rpcClient, chainId, session);
    }
}
