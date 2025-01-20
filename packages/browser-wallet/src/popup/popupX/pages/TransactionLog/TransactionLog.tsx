import React, { useEffect, useMemo, useState } from 'react';
import Note from '@assets/svgX/note.svg';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import { relativeRoutes } from '@popup/popupX/constants/routes';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import * as WalletProxy from '@popup/shared/utils/wallet-proxy';
import {
    BrowserWalletTransaction,
    RewardType,
    SpecialTransactionType,
} from '@popup/shared/utils/transaction-history-types';
import { useTranslation, TFunction } from 'react-i18next';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '@popup/state';
import { displayAsCcd } from 'wallet-common-helpers';
import { AccountTransactionType } from '@concordium/web-sdk';
import { displaySplitAddressShort } from '@popup/shared/utils/account-helpers';
import Button from '@popup/popupX/shared/Button';

/** The max number of transactions to query per request to the wallet proxy. */
const transactionResultLimit = 20;

/**
 * Fetch every account transaction for accountAddress that have an ID higher or equal to fromId from the wallet proxy.
 * Throws if the request to the wallet proxy fails.
 */
async function fetchLatestAccountTransactions(
    accountAddress: string,
    signal?: AbortSignal
): Promise<BrowserWalletTransaction[]> {
    const transactions: BrowserWalletTransaction[] = [];
    let startingId;
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const result = await WalletProxy.getTransactions(accountAddress, transactionResultLimit, 'ascending', {
            from: startingId,
            signal,
        });
        const newestTransaction = result.transactions.at(-1);
        if (newestTransaction === undefined) {
            // Received no new transactions, so we don't expect any more.
            return transactions;
        }
        for (const tx of result.transactions) {
            transactions.push(tx);
        }
        if (!result.full) {
            // Received less than the requested limit, so we don't expect any more.
            return transactions;
        }
        startingId = newestTransaction.id;
    }
}

/**
 * Update an existing list of descending transactions with a new list of ascending transactions,
 * ensuring that any overlaps are updated with the values from the new list of transactions.
 * If newTransactions is empty, reference to the existingTransactions is returned directly.
 * The items in newTransactions are moved to the new array without copying.
 */
function replaceTransactionsWithNewTransactions(
    existingTransactions: BrowserWalletTransaction[],
    newTransactions: BrowserWalletTransaction[]
) {
    const firstNew = newTransactions.at(0);
    if (firstNew === undefined) {
        // No new transactions.
        return existingTransactions;
    }
    const newTransactionsDescending = [...newTransactions].reverse();
    if (existingTransactions.length === 0) {
        // No existing transactions.
        return newTransactionsDescending;
    }
    // Scan for point of overlap
    const updateFromIndex = existingTransactions.findIndex((existing) => existing.id < firstNew.id);
    if (updateFromIndex === -1) {
        // Every existing transaction needs to be updated.
        return newTransactionsDescending;
    }
    // Move over the existing transactions that are not overlapping.
    for (const existing of existingTransactions.slice(updateFromIndex)) {
        newTransactionsDescending.push(existing);
    }
    return newTransactionsDescending;
}

/** Hook fetching the transaction list for an account. */
function useAccountTransactionList(accountAddress: string) {
    const [transactions, setTransactions] = useState<BrowserWalletTransaction[]>([]);
    const addToast = useSetAtom(addToastAtom);
    const { t } = useTranslation('transactionLog');
    useEffect(() => {
        const abortController = new AbortController();
        fetchLatestAccountTransactions(accountAddress, abortController.signal)
            .then((newTransactions) => {
                setTransactions((existingTransactions) =>
                    replaceTransactionsWithNewTransactions(existingTransactions, newTransactions)
                );
            })
            .catch(() => {
                addToast(t('error'));
            });
        return () => {
            abortController.abort();
        };
    }, [accountAddress]);
    return transactions;
}

/** Convert Date object to local string only showing the current date. */
const onlyDate = (date?: number | Date | undefined) =>
    `${Intl.DateTimeFormat(undefined, {
        day: '2-digit',
    }).format(date)} ${Intl.DateTimeFormat(undefined, {
        month: 'short',
        year: 'numeric',
    }).format(date)}`;
/** Convert Date object to local string only showing the current time. */
const onlyTime = Intl.DateTimeFormat(undefined, {
    timeStyle: 'short',
    hour12: false,
}).format;

/** Check if type is an account transaction which transfers some CCD. */
function isTransferTransaction(
    type: AccountTransactionType | RewardType | SpecialTransactionType
): type is AccountTransactionType {
    switch (type) {
        case AccountTransactionType.Transfer:
        case AccountTransactionType.TransferWithMemo:
        case AccountTransactionType.TransferToEncrypted:
        case AccountTransactionType.TransferToPublic:
        case AccountTransactionType.TransferWithSchedule:
        case AccountTransactionType.TransferWithScheduleAndMemo:
        case AccountTransactionType.EncryptedAmountTransfer:
        case AccountTransactionType.EncryptedAmountTransferWithMemo:
            return true;
        default:
            return false;
    }
}

/** Check if type is an account transaction which transfers some CCD or is a reward. */
function hasAmount(type: AccountTransactionType | RewardType | SpecialTransactionType) {
    return isTransferTransaction(type) || type in RewardType;
}

/**
 * Maps transaction type to a displayable text string.
 */
function mapTypeToText(
    type: AccountTransactionType | RewardType | SpecialTransactionType,
    t: TFunction<'x', 'transactionLogX'>
): string {
    switch (type) {
        case AccountTransactionType.DeployModule:
            return t('deployModule');
        case AccountTransactionType.InitContract:
            return t('initContract');
        case AccountTransactionType.Update:
            return t('update');
        case AccountTransactionType.Transfer:
            return t('transfer');
        case AccountTransactionType.AddBaker:
            return t('addBaker');
        case AccountTransactionType.RemoveBaker:
            return t('removeBaker');
        case AccountTransactionType.UpdateBakerStake:
            return t('updateBakerStake');
        case AccountTransactionType.UpdateBakerRestakeEarnings:
            return t('updateBakerRestakeEarnings');
        case AccountTransactionType.UpdateBakerKeys:
            return t('updateBakerKeys');
        case AccountTransactionType.UpdateCredentialKeys:
            return t('updateCredentialKeys');
        case RewardType.BakingReward:
            return t('bakingReward');
        case RewardType.BlockReward:
            return t('blockReward');
        case RewardType.FinalizationReward:
            return t('finalizationReward');
        case AccountTransactionType.EncryptedAmountTransfer:
            return t('encryptedAmountTransfer');
        case AccountTransactionType.TransferToEncrypted:
            return t('transferToEncrypted');
        case AccountTransactionType.TransferToPublic:
            return t('transferToPublic');
        case AccountTransactionType.TransferWithSchedule:
            return t('transferWithSchedule');
        case AccountTransactionType.UpdateCredentials:
            return t('updateCredentials');
        case AccountTransactionType.RegisterData:
            return t('registerData');
        case AccountTransactionType.TransferWithMemo:
            return t('transferWithMemo');
        case AccountTransactionType.EncryptedAmountTransferWithMemo:
            return t('encryptedAmountTransferWithMemo');
        case AccountTransactionType.TransferWithScheduleAndMemo:
            return t('transferWithScheduleAndMemo');
        case AccountTransactionType.ConfigureBaker:
            return t('configureBaker');
        case AccountTransactionType.ConfigureDelegation:
            return t('configureDelegation');
        case RewardType.StakingReward:
            return t('stakingReward');
        case SpecialTransactionType.Malformed:
            return t('malformed');
        default:
            return t('unknown');
    }
}

/** Convert transactions fetched from the wallet proxy into data format expected by the view.
Assumes 'transactions' are sorted by time in descending order.
 */
function convertToLogEntry(
    accountAddress: string,
    transactions: BrowserWalletTransaction[],
    t: TFunction<'x', 'transactionLogX'>
): DayLogEntry[] {
    const dayLogs = [];
    let dayLog: DayLogEntry | undefined;
    for (const tx of transactions) {
        const dateTime = new Date(Number(tx.time * 1000n));
        const date = onlyDate(dateTime);
        const transactionLog: TransactionLogEntry = {
            date,
            hash: tx.transactionHash,
            type: mapTypeToText(tx.type, t),
            income: tx.fromAddress !== accountAddress,
            amount: hasAmount(tx.type) ? displayAsCcd(tx.amount, false, true) : undefined,
            time: onlyTime(dateTime),
            info: (tx.cost !== undefined && t('withFee', { value: displayAsCcd(tx.cost, false, true) })) || '',
            note: tx.memo,
            block: tx.blockHash,
            events: tx.events ?? [],
            fromAddress: tx.fromAddress,
            fromAddressShort: tx.fromAddress && t('from', { value: displaySplitAddressShort(tx.fromAddress) }),
            toAddress: tx.toAddress,
        };
        if (dayLog === undefined || dayLog.date !== date) {
            dayLog = {
                date,
                total: displayAsCcd(tx.amount),
                transactions: [transactionLog],
            };
            dayLogs.push(dayLog);
        } else {
            dayLog.transactions.push(transactionLog);
        }
    }
    return dayLogs;
}

/** Transaction information. */
export type TransactionLogEntry = {
    /** Hash of the transaction. */
    hash: string;
    /** Hash of the block which included this transaction. */
    block: string;
    /** Localized date string. Date of the block including this transaction.  */
    date: string;
    /** Localized time string. Time of the block including this transaction. */
    time: string; // '11:24',
    /** Readable transaction type. */
    type: string; // 'Unstaked amount',
    /** Whether this transaction should be considered as income. */
    income: boolean;
    /** The amount of CCD/tokens being transferred/rewarded, includes the token symbol. Is undefined for transactions which are not relevant. */
    amount?: string; // 10.02,
    /** Fee information. */
    info: string; // 'with fee 0.02 CCD',
    /** Transaction memo. */
    note?: string;
    /** Summary of the events in the transaction. */
    events: string[];
    /** Account address which sent the transaction. */
    fromAddress?: string;
    /** Account address which sent the transaction short display. */
    fromAddressShort?: string;
    /** Account address which received funds. */
    toAddress?: string;
};

/** Transactions group together for a given day. */
type DayLogEntry = {
    /** Localized date string. Date of the block.  */
    date: string; // '21 May 2024',
    /** Total income for transactions added this day. */
    total: string; // '4029.87',
    /** Transactions for this day. */
    transactions: TransactionLogEntry[];
};

/** Parameters parsed from the path */
type Params = {
    /** Address of the account to display transactions for. */
    account: string;
};

type TransactionLogProps = { account: string };

function TransactionLog({ account }: TransactionLogProps) {
    const nav = useNavigate();
    const { t } = useTranslation('x', { keyPrefix: 'transactionLogX' });

    const navToTransactionDetails = (transaction: TransactionLogEntry) =>
        nav(relativeRoutes.home.transactionLog.details.path, { state: { transaction } });
    const transactionList = useAccountTransactionList(account);
    const transactionLogs = useMemo(() => convertToLogEntry(account, transactionList, t), [transactionList]);

    return (
        <Page className="transaction-log">
            <Page.Top heading={t('title')} />
            <Page.Main>
                <div className="transaction-log__history">
                    {transactionLogs.map((day) => (
                        <div key={day.date} className="transaction-log__history_day">
                            <div className="transaction-log__history_day-date">
                                <Text.CaptureAdditional>{day.date}</Text.CaptureAdditional>
                                {/* <Text.CaptureAdditional>${day.total}</Text.CaptureAdditional> */}
                            </div>
                            {day.transactions.map((transaction) => (
                                // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
                                <Button.Base
                                    key={transaction.block}
                                    className="transaction-log__history_transaction"
                                    onClick={() => navToTransactionDetails(transaction)}
                                >
                                    <div className="transaction value">
                                        <Text.Label>{transaction.type}</Text.Label>
                                        <Text.Label className={transaction.income ? 'income' : ''}>
                                            {transaction.amount}
                                        </Text.Label>
                                    </div>
                                    <div className="transaction info">
                                        <Text.Capture>{transaction.time}</Text.Capture>
                                        <Text.Capture>{transaction.info || transaction.fromAddressShort}</Text.Capture>
                                    </div>
                                    {transaction.note && (
                                        <div className="transaction note">
                                            <Note />
                                            <Text.Capture>{transaction.note}</Text.Capture>
                                        </div>
                                    )}
                                </Button.Base>
                            ))}
                        </div>
                    ))}
                </div>
            </Page.Main>
        </Page>
    );
}

export default function Loader() {
    const params = useParams<Params>();
    if (params.account === undefined) {
        // No account address in the path.
        return <Navigate to="../" />;
    }
    return <TransactionLog account={params.account} />;
}
