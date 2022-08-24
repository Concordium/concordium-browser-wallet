import { AccountTransactionType } from '@concordium/web-sdk';

/**
 * The interface for the result of a query to get historical transactions for
 * an account, e.g. from the wallet proxy.
 */
export interface TransactionHistoryResult {
    /** full indicates that the number of transactions received is equal to the limit given, i.e. it indicates that there could be additional transactions available. */
    full: boolean;
    transactions: BrowserWalletTransaction[];
}

export enum TransactionStatus {
    /** On-chain but with an error */
    Failed = 'failed',
    /** On-chain and successful */
    Finalized = 'finalized',
}

export enum RewardType {
    BakingReward = 'BakingReward',
    BlockReward = 'BlockReward',
    FinalizationReward = 'FinalizationReward',
    StakingReward = 'StakingReward',
}

/**
 * Internal model for transactions that have been fetched externally to be mapped into. Used for keeping
 * a consistent internal model for the display of transactions.
 */
export interface BrowserWalletTransaction {
    fromAddress: string | undefined;
    toAddress: string | undefined;
    transactionHash: string;
    blockHash: string;
    amount: bigint;
    cost?: bigint;
    type: AccountTransactionType | RewardType;
    status: TransactionStatus;
    time: bigint;
    id: number;
    events: string[];
    rejectReason: string;
}

export interface BrowserWalletAccountTransaction extends BrowserWalletTransaction {
    type: AccountTransactionType;
}

export function isAccountTransaction(
    transaction: BrowserWalletTransaction
): transaction is BrowserWalletAccountTransaction {
    return transaction.type in AccountTransactionType;
}
