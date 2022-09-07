import { AccountTransactionType } from '@concordium/web-sdk';
import axios from 'axios';
import { abs } from 'wallet-common-helpers';
import { IdentityProvider } from '@shared/storage/types';
import { storedCurrentNetwork } from '@shared/storage/access';
import {
    BrowserWalletTransaction,
    RewardType,
    TransactionHistoryResult,
    TransactionStatus,
} from './transaction-history-types';

async function getWalletProxy() {
    const currentNetwork = await storedCurrentNetwork.get();
    if (currentNetwork) {
        return axios.create({ baseURL: currentNetwork.explorerUrl });
    }
    throw new Error('Tried to access wallet proxy without a loaded network.');
}

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

function mapTransactionKindStringToTransactionType(kind: TransactionKindString): AccountTransactionType | RewardType {
    switch (kind) {
        case TransactionKindString.DeployModule:
            return AccountTransactionType.DeployModule;
        case TransactionKindString.InitContract:
            return AccountTransactionType.InitializeSmartContractInstance;
        case TransactionKindString.Update:
            return AccountTransactionType.UpdateSmartContractInstance;
        case TransactionKindString.Transfer:
            return AccountTransactionType.SimpleTransfer;
        case TransactionKindString.AddBaker:
            return AccountTransactionType.AddBaker;
        case TransactionKindString.RemoveBaker:
            return AccountTransactionType.RemoveBaker;
        case TransactionKindString.UpdateBakerStake:
            return AccountTransactionType.UpdateBakerStake;
        case TransactionKindString.UpdateBakerRestakeEarnings:
            return AccountTransactionType.UpdateBakerRestakeEarnings;
        case TransactionKindString.UpdateBakerKeys:
            return AccountTransactionType.UpdateBakerKeys;
        case TransactionKindString.UpdateCredentialKeys:
            return AccountTransactionType.UpdateCredentialKeys;
        case TransactionKindString.BakingReward:
            return RewardType.BakingReward;
        case TransactionKindString.BlockReward:
            return RewardType.BlockReward;
        case TransactionKindString.FinalizationReward:
            return RewardType.FinalizationReward;
        case TransactionKindString.EncryptedAmountTransfer:
            return AccountTransactionType.EncryptedTransfer;
        case TransactionKindString.TransferToEncrypted:
            return AccountTransactionType.TransferToEncrypted;
        case TransactionKindString.TransferToPublic:
            return AccountTransactionType.TransferToPublic;
        case TransactionKindString.TransferWithSchedule:
            return AccountTransactionType.TransferWithSchedule;
        case TransactionKindString.UpdateCredentials:
            return AccountTransactionType.UpdateCredentials;
        case TransactionKindString.RegisterData:
            return AccountTransactionType.RegisterData;
        case TransactionKindString.TransferWithMemo:
            return AccountTransactionType.SimpleTransferWithMemo;
        case TransactionKindString.EncryptedAmountTransferWithMemo:
            return AccountTransactionType.EncryptedTransferWithMemo;
        case TransactionKindString.TransferWithScheduleAndMemo:
            return AccountTransactionType.TransferWithScheduleWithMemo;
        case TransactionKindString.ConfigureBaker:
            return AccountTransactionType.ConfigureBaker;
        case TransactionKindString.ConfigureDelegation:
            return AccountTransactionType.ConfigureDelegation;
        case TransactionKindString.StakingReward:
            return RewardType.StakingReward;
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
    events: string[];
    rejectReason: string;
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
        events: transaction.details.events,
        rejectReason: transaction.details.rejectReason,
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

    const response = await (await getWalletProxy()).get(proxyPath);
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

export async function getIdentityProviders(): Promise<IdentityProvider[]> {
    const proxyPath = `/v1/ip_info`;
    const response = await (await getWalletProxy()).get(proxyPath);
    return response.data;
}

export async function getSimpleTransferCost(): Promise<bigint> {
    const proxyPath = `/v0/transactionCost?type=simpleTransfer`;
    const response = await (await getWalletProxy()).get(proxyPath);
    return BigInt(response.data.cost);
}

export async function getCcdDrop(accountAddress: string): Promise<BrowserWalletTransaction> {
    const response = await (await getWalletProxy()).put(`/v0/testnetGTUDrop/${accountAddress}`);

    const ccdDropTransaction: BrowserWalletTransaction = {
        amount: BigInt(2000000000),
        blockHash: '',
        events: [],
        type: AccountTransactionType.SimpleTransfer,
        status: TransactionStatus.Pending,
        time: BigInt(Math.round(Date.now() / 1000)),
        id: 0,
        transactionHash: response.data.submissionId,
        fromAddress: undefined,
        toAddress: accountAddress,
    };

    return ccdDropTransaction;
}
