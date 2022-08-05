import axios from 'axios';
import { abs } from 'wallet-common-helpers';
import {
    BrowserWalletTransaction,
    TransactionHistoryResult,
    TransactionStatus,
    TransactionType,
} from './transaction-history-types';

// TODO The wallet proxy URL should be taken from storage when that has been
// implemented.
const walletProxy = axios.create({
    baseURL: 'https://wallet-proxy.testnet.concordium.com',
});

export enum TransactionKindString {
    DeployModule = 'deployModule',
    InitContract = 'initContract',
    Update = 'update',
    Transfer = 'transfer',
    AddBaker = 'addBaker',
    RemoveBaker = 'removeBaker',
    UpdateBakerStake = 'updateBakerStake',
    UpdateBakerRestakeEarnings = 'updateBakerRestakeEarnings',
    UpdateBakerKeys = 'updateBakerKeys',
    UpdateCredentialKeys = 'updateCredentialKeys',
    BakingReward = 'bakingReward',
    BlockReward = 'blockReward',
    FinalizationReward = 'finalizationReward',
    EncryptedAmountTransfer = 'encryptedAmountTransfer',
    TransferToEncrypted = 'transferToEncrypted',
    TransferToPublic = 'transferToPublic',
    TransferWithSchedule = 'transferWithSchedule',
    UpdateCredentials = 'updateCredentials',
    RegisterData = 'registerData',
    TransferWithMemo = 'transferWithMemo',
    EncryptedAmountTransferWithMemo = 'encryptedAmountTransferWithMemo',
    TransferWithScheduleAndMemo = 'transferWithScheduleAndMemo',
    ConfigureBaker = 'configureBaker',
    ConfigureDelegation = 'configureDelegation',
    StakingReward = 'paydayAccountReward',
    Malformed = 'Malformed account transaction',
}

function mapTransactionKindStringToTransactionType(kind: TransactionKindString): TransactionType {
    switch (kind) {
        case TransactionKindString.DeployModule:
            return TransactionType.DeployModule;
        case TransactionKindString.InitContract:
            return TransactionType.InitContract;
        case TransactionKindString.Update:
            return TransactionType.Update;
        case TransactionKindString.Transfer:
            return TransactionType.Transfer;
        case TransactionKindString.AddBaker:
            return TransactionType.AddBaker;
        case TransactionKindString.RemoveBaker:
            return TransactionType.RemoveBaker;
        case TransactionKindString.UpdateBakerStake:
            return TransactionType.UpdateBakerStake;
        case TransactionKindString.UpdateBakerRestakeEarnings:
            return TransactionType.UpdateBakerRestakeEarnings;
        case TransactionKindString.UpdateBakerKeys:
            return TransactionType.UpdateBakerKeys;
        case TransactionKindString.UpdateCredentialKeys:
            return TransactionType.UpdateCredentialKeys;
        case TransactionKindString.BakingReward:
            return TransactionType.BakingReward;
        case TransactionKindString.BlockReward:
            return TransactionType.BlockReward;
        case TransactionKindString.FinalizationReward:
            return TransactionType.FinalizationReward;
        case TransactionKindString.EncryptedAmountTransfer:
            return TransactionType.EncryptedAmountTransfer;
        case TransactionKindString.TransferToEncrypted:
            return TransactionType.TransferToEncrypted;
        case TransactionKindString.TransferToPublic:
            return TransactionType.TransferToPublic;
        case TransactionKindString.TransferWithSchedule:
            return TransactionType.TransferWithSchedule;
        case TransactionKindString.UpdateCredentials:
            return TransactionType.UpdateCredentials;
        case TransactionKindString.RegisterData:
            return TransactionType.RegisterData;
        case TransactionKindString.TransferWithMemo:
            return TransactionType.TransferWithMemo;
        case TransactionKindString.EncryptedAmountTransferWithMemo:
            return TransactionType.EncryptedAmountTransferWithMemo;
        case TransactionKindString.TransferWithScheduleAndMemo:
            return TransactionType.TransferWithScheduleAndMemo;
        case TransactionKindString.ConfigureBaker:
            return TransactionType.ConfigureBaker;
        case TransactionKindString.ConfigureDelegation:
            return TransactionType.ConfigureDelegation;
        case TransactionKindString.StakingReward:
            return TransactionType.StakingReward;
        default:
            throw Error(`Unkown transaction kind was encounted: ${kind}`);
    }
}

interface WalletProxyAccTransactionsResult {
    count: number;
    limit: number;
    order: string;
    transactions: WalletProxyTransaction[];
}

interface Details {
    type: TransactionKindString;
    outcome: string;
    transferSource: string;
    transferDestination: string;
}

enum OriginType {
    Self = 'self',
    Account = 'account',
    Reward = 'reward',
    None = 'none',
}

interface TransactionOrigin {
    type: OriginType;
    address?: string;
}

export interface WalletProxyTransaction {
    id: number;
    blockHash: string;
    cost: string;
    transactionHash: string;
    details: Details;
    origin: TransactionOrigin;
    blockTime: number;
    total: string;
    subtotal: string;
}

/**
 * Derives the account address that was the source of the transaction.
 * @param transaction the raw transaction from the wallet proxy
 * @param accountAddress the account address used when querying for the supplied transaction
 * @returns the from account address for the provided transaction
 */
function getFromAddress(transaction: WalletProxyTransaction, accountAddress: string): string | undefined {
    const originType = transaction.origin.type;

    if (transaction.details.transferSource) {
        return transaction.details.transferSource;
    }
    if (originType === OriginType.Account && transaction.origin.address) {
        return transaction.origin.address;
    }
    if (originType === OriginType.Self) {
        return accountAddress;
    }
    if (originType === OriginType.Reward) {
        return undefined;
    }
    throw new Error(
        `The received transaction is malformed. Could not find information to determine from address. ${JSON.stringify(
            transaction
        )}`
    );
}

/**
 * Derives the account address that the transaction was sent to.
 * @param transaction the raw transaction from the wallet proxy
 * @param accountAddress the account address used when querying for the supplied transaction
 * @returns the to account address, i.e. the account that the transaction was sent to. This is undefined for smart contract updates.
 */
function getToAddress(transaction: WalletProxyTransaction, accountAddress: string): string | undefined {
    if (transaction.details.transferDestination) {
        return transaction.details.transferDestination;
    }
    if (transaction.origin.type === OriginType.Reward) {
        return accountAddress;
    }
    if (transaction.origin.type === OriginType.Self) {
        return undefined;
    }
    throw new Error(
        `The received transaction is malformed. Could not find information to determine to address. ${JSON.stringify(
            transaction
        )}`
    );
}

function calculateAmount(transaction: WalletProxyTransaction, status: TransactionStatus): bigint {
    if (status === TransactionStatus.Failed) {
        return transaction.subtotal ? BigInt(transaction.subtotal) : BigInt(0);
    }

    if (transaction.subtotal === undefined) {
        return abs(BigInt(transaction.total)) - abs(BigInt(transaction.cost || '0'));
    }

    return BigInt(transaction.subtotal);
}

function mapTransaction(transaction: WalletProxyTransaction, accountAddress: string): BrowserWalletTransaction {
    const success = transaction.details.outcome === 'success';
    const status = success ? TransactionStatus.Finalized : TransactionStatus.Failed;
    const type = mapTransactionKindStringToTransactionType(transaction.details.type);

    return {
        amount: calculateAmount(transaction, status),
        cost: transaction.cost ? BigInt(transaction.cost) : undefined,
        blockHash: transaction.blockHash,
        fromAddress: getFromAddress(transaction, accountAddress),
        toAddress: getToAddress(transaction, accountAddress),
        transactionHash: transaction.transactionHash,
        type,
        status,
        time: BigInt(Math.round(transaction.blockTime).toString()),
        id: transaction.id,
    };
}

export async function getTransactions(
    accountAddress: string,
    resultLimit: number,
    order: 'ascending' | 'descending',
    from?: number
): Promise<TransactionHistoryResult> {
    let proxyPath = `/v1/accTransactions/${accountAddress}?limit=${resultLimit}&order=${order.toString()}&includeRawRejectReason`;
    if (from) {
        proxyPath += `&from=${from}`;
    }

    const response = await walletProxy.get(proxyPath);
    const result: WalletProxyAccTransactionsResult = response.data;
    const transactionsWithoutMalformed = result.transactions.filter(
        (t) => t.details.type !== TransactionKindString.Malformed
    );
    const transactions = transactionsWithoutMalformed.map((t) => mapTransaction(t, accountAddress));
    return {
        transactions,
        full: result.limit === result.count,
    };
}
