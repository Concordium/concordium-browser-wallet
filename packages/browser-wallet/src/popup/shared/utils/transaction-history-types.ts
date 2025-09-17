import {
    AccountTransactionSummary,
    AccountTransactionType,
    ConcordiumGRPCWebClient,
    ContractTraceEvent,
    BakerEvent,
    DelegationEvent,
    FinalizedBlockItem,
    TransactionEvent,
    TransactionEventTag,
    TransactionKindString,
    TransactionSummaryType,
    getTransactionRejectReason,
} from '@concordium/web-sdk';
import JSONBig from 'json-bigint';
import { logError } from '@shared/utils/log-helpers';

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
    /** Sent to node, pending finalization or failure */
    Pending = 'pending',
}

export enum RewardType {
    BakingReward = 'BakingReward',
    BlockReward = 'BlockReward',
    FinalizationReward = 'FinalizationReward',
    StakingReward = 'StakingReward',
}

export enum SpecialTransactionType {
    ChainUpdate = 'ChainUpdate',
    UpdateCreatePLT = 'UpdateCreatePLT',
    Malformed = 'Malformed',
    Other = 'Other',
}

// ToDo remove after web-sdk update
export enum TransactionKindStringSpecial {
    ChainUpdate = 'chainUpdate',
    UpdateCreatePLT = 'updateCreatePLT',
}

export enum BlockSpecialEvent {
    BakingRewards = 'bakingRewards',
    Mint = 'mint',
    FinalizationRewards = 'finalizationRewards',
    PaydayFoundationReward = 'paydayFoundationReward',
    BlockAccrueReward = 'blockAccrueReward',
    PaydayPoolReward = 'paydayPoolReward',
    ValidatorSuspended = 'validatorSuspended',
    ValidatorPrimedForSuspension = 'validatorPrimedForSuspension',
}

function mapTransactionKindStringToTransactionType(
    kind: TransactionKindString | TransactionKindStringSpecial | BlockSpecialEvent
): AccountTransactionType | RewardType | SpecialTransactionType | BlockSpecialEvent {
    switch (kind) {
        case TransactionKindString.DeployModule:
            return AccountTransactionType.DeployModule;
        case TransactionKindString.InitContract:
            return AccountTransactionType.InitContract;
        case TransactionKindString.Update:
            return AccountTransactionType.Update;
        case TransactionKindString.Transfer:
            return AccountTransactionType.Transfer;
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
            return AccountTransactionType.EncryptedAmountTransfer;
        case TransactionKindString.TransferToEncrypted:
            return AccountTransactionType.TransferToEncrypted;
        case TransactionKindString.TransferToPublic:
            return AccountTransactionType.TransferToPublic;
        case TransactionKindString.TransferWithSchedule:
            return AccountTransactionType.TransferWithSchedule;
        case TransactionKindString.TokenUpdate:
            return AccountTransactionType.TokenUpdate;
        case TransactionKindStringSpecial.ChainUpdate:
            return SpecialTransactionType.ChainUpdate;
        case TransactionKindStringSpecial.UpdateCreatePLT:
            return SpecialTransactionType.UpdateCreatePLT;
        case TransactionKindString.UpdateCredentials:
            return AccountTransactionType.UpdateCredentials;
        case TransactionKindString.RegisterData:
            return AccountTransactionType.RegisterData;
        case TransactionKindString.TransferWithMemo:
            return AccountTransactionType.TransferWithMemo;
        case TransactionKindString.EncryptedAmountTransferWithMemo:
            return AccountTransactionType.EncryptedAmountTransferWithMemo;
        case TransactionKindString.TransferWithScheduleAndMemo:
            return AccountTransactionType.TransferWithScheduleAndMemo;
        case TransactionKindString.ConfigureBaker:
            return AccountTransactionType.ConfigureBaker;
        case TransactionKindString.ConfigureDelegation:
            return AccountTransactionType.ConfigureDelegation;
        case TransactionKindString.StakingReward:
            return RewardType.StakingReward;
        case BlockSpecialEvent.BakingRewards:
            return BlockSpecialEvent.BakingRewards;
        case BlockSpecialEvent.Mint:
            return BlockSpecialEvent.Mint;
        case BlockSpecialEvent.FinalizationRewards:
            return BlockSpecialEvent.FinalizationRewards;
        case BlockSpecialEvent.PaydayFoundationReward:
            return BlockSpecialEvent.PaydayFoundationReward;
        case BlockSpecialEvent.BlockAccrueReward:
            return BlockSpecialEvent.BlockAccrueReward;
        case BlockSpecialEvent.PaydayPoolReward:
            return BlockSpecialEvent.PaydayPoolReward;
        case BlockSpecialEvent.ValidatorSuspended:
            return BlockSpecialEvent.ValidatorSuspended;
        case BlockSpecialEvent.ValidatorPrimedForSuspension:
            return BlockSpecialEvent.ValidatorPrimedForSuspension;
        default: {
            // Throwing error at this point, fails Transaction Log to render. Replaced with logError
            logError(`Unknown transaction kind was encounted: ${kind}`);
            return SpecialTransactionType.Other;
        }
    }
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
    type: AccountTransactionType | RewardType | SpecialTransactionType | BlockSpecialEvent;
    status: TransactionStatus;
    time: bigint;
    id: number;
    events?: string[];
    rejectReason?: string;
    memo?: string;
    tokenTransfer?: {
        decimals: number;
        value: string;
        tokenId: string;
    };
}

export interface BrowserWalletAccountTransaction extends BrowserWalletTransaction {
    type: AccountTransactionType;
}

function getTransactionAmount(account: string, summary: AccountTransactionSummary): bigint {
    switch (summary.transactionType) {
        case TransactionKindString.InitContract:
            return summary.contractInitialized.amount.microCcdAmount;
        case TransactionKindString.Update:
            return summary.events.reduce((acc: bigint, e) => {
                switch (e.tag) {
                    case TransactionEventTag.Updated:
                        return acc - e.amount.microCcdAmount;
                    case TransactionEventTag.Transferred: {
                        if (e.to.address === account) {
                            return acc + e.amount.microCcdAmount;
                        }
                        return acc;
                    }
                    default:
                        return acc;
                }
            }, 0n);
        case TransactionKindString.Transfer:
        case TransactionKindString.TransferWithMemo:
            return summary.sender.address === account
                ? -summary.transfer.amount.microCcdAmount
                : summary.transfer.amount.microCcdAmount;
        case TransactionKindString.TransferWithSchedule: {
            const amount = summary.event.amount.reduce((acc, release) => acc + release.amount.microCcdAmount, 0n);
            return summary.sender.address === account ? -amount : amount;
        }
        case TransactionKindString.TransferWithScheduleAndMemo: {
            const amount = summary.transfer.amount.reduce((acc, release) => acc + release.amount.microCcdAmount, 0n);
            return summary.sender.address === account ? -amount : amount;
        }
        default:
            return 0n;
    }
}

function getTransactionReceiver(summary: AccountTransactionSummary): string | undefined {
    switch (summary.transactionType) {
        case TransactionKindString.Transfer:
        case TransactionKindString.TransferWithMemo:
            return summary.transfer.to.address;
        default:
            return undefined;
    }
}

function getTransactionMemo(summary: AccountTransactionSummary): string | undefined {
    switch (summary.transactionType) {
        case TransactionKindString.TransferWithMemo:
        case TransactionKindString.TransferWithScheduleAndMemo:
        case TransactionKindString.EncryptedAmountTransferWithMemo:
            return summary.memo.memo;
        default:
            return undefined;
    }
}

function getTransactionEvents(summary: AccountTransactionSummary): string[] | undefined {
    const toString = ({ tag, ...rest }: TransactionEvent | ContractTraceEvent | BakerEvent | DelegationEvent) =>
        `${tag}\n${JSONBig.stringify(rest)}`;

    switch (summary.transactionType) {
        case TransactionKindString.Update:
        case TransactionKindString.ConfigureBaker:
        case TransactionKindString.ConfigureDelegation:
            return summary.events.map(toString);
        default:
            return undefined;
    }
}

export async function toBrowserWalletTransaction(
    { outcome: { blockHash, summary } }: FinalizedBlockItem,
    account: string,
    transactionHash: string,
    grpc: ConcordiumGRPCWebClient
): Promise<BrowserWalletTransaction> {
    const block = await grpc.getBlockInfo(blockHash);
    const time = BigInt(Math.round(block.blockSlotTime.getTime() / 1000));
    const id = -1;

    if (summary.type !== TransactionSummaryType.AccountTransaction) {
        return {
            blockHash: blockHash.toString(),
            transactionHash: transactionHash.toString(),
            fromAddress: undefined,
            toAddress: undefined,
            amount: 0n,
            id,
            type: SpecialTransactionType.Other,
            time,
            status: TransactionStatus.Finalized,
        };
    }

    let type: AccountTransactionType | RewardType | SpecialTransactionType | BlockSpecialEvent;
    if (summary.transactionType === TransactionKindString.Failed && summary.failedTransactionType === undefined) {
        type = SpecialTransactionType.Malformed;
    } else {
        type = mapTransactionKindStringToTransactionType(
            summary.transactionType === TransactionKindString.Failed && summary.failedTransactionType !== undefined
                ? summary.failedTransactionType
                : summary.transactionType
        );
    }
    const status =
        summary.transactionType === TransactionKindString.Failed
            ? TransactionStatus.Failed
            : TransactionStatus.Finalized;

    return {
        blockHash: blockHash.toString(),
        transactionHash: summary.hash.toString(),
        fromAddress: summary.sender.address,
        toAddress: getTransactionReceiver(summary),
        amount: getTransactionAmount(account, summary),
        id,
        type,
        time,
        status,
        cost: summary.cost,
        rejectReason: getTransactionRejectReason(summary)?.tag,
        memo: getTransactionMemo(summary),
        events: getTransactionEvents(summary),
    };
}

export function isAccountTransaction(
    transaction: BrowserWalletTransaction
): transaction is BrowserWalletAccountTransaction {
    return transaction.type in AccountTransactionType;
}
