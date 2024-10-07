import React, { useEffect, useMemo, useState } from 'react';
import Note from '@assets/svgX/note.svg';
import { useNavigate } from 'react-router-dom';
import { relativeRoutes } from '@popup/popupX/constants/routes';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import * as WalletProxy from '@popup/shared/utils/wallet-proxy';
import {
    BrowserWalletTransaction,
    RewardType,
    SpecialTransactionType,
} from '@popup/shared/utils/transaction-history-types';
import { useTranslation } from 'react-i18next';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '@popup/state';
import { displayAsCcd } from 'wallet-common-helpers';
import { AccountTransactionType } from '@concordium/web-sdk';

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
    let startingId = undefined;
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
const onlyDate = Intl.DateTimeFormat(undefined, {
    dateStyle: 'medium',
}).format;
/** Convert Date object to local string only showing the current time. */
const onlyTime = Intl.DateTimeFormat(undefined, {
    timeStyle: 'medium',
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
function mapTypeToText(type: AccountTransactionType | RewardType | SpecialTransactionType): string {
    switch (type) {
        case AccountTransactionType.DeployModule:
            return 'Module deployment';
        case AccountTransactionType.InitContract:
            return 'Contract initialization';
        case AccountTransactionType.Update:
            return 'Contract update';
        case AccountTransactionType.Transfer:
            return 'Transfer';
        case AccountTransactionType.AddBaker:
            return 'Add validator';
        case AccountTransactionType.RemoveBaker:
            return 'Remove validator';
        case AccountTransactionType.UpdateBakerStake:
            return 'Validator stake update';
        case AccountTransactionType.UpdateBakerRestakeEarnings:
            return 'Validator restake earnings update';
        case AccountTransactionType.UpdateBakerKeys:
            return 'Validator keys update';
        case AccountTransactionType.UpdateCredentialKeys:
            return 'Account keys update';
        case RewardType.BakingReward:
            return 'Baking reward';
        case RewardType.BlockReward:
            return 'Block reward';
        case RewardType.FinalizationReward:
            return 'Finalization reward';
        case AccountTransactionType.EncryptedAmountTransfer:
            return 'Shielded transfer';
        case AccountTransactionType.TransferToEncrypted:
            return 'Shielded amount';
        case AccountTransactionType.TransferToPublic:
            return 'Unshielded amount';
        case AccountTransactionType.TransferWithSchedule:
            return 'Scheduled transfer';
        case AccountTransactionType.UpdateCredentials:
            return 'Credentials update';
        case AccountTransactionType.RegisterData:
            return 'Data registration';
        case AccountTransactionType.TransferWithMemo:
            return 'Transfer';
        case AccountTransactionType.EncryptedAmountTransferWithMemo:
            return 'Shielded transfer';
        case AccountTransactionType.TransferWithScheduleAndMemo:
            return 'Scheduled transfer';
        case AccountTransactionType.ConfigureBaker:
            return 'Configure validator';
        case AccountTransactionType.ConfigureDelegation:
            return 'Configure delegation';
        case RewardType.StakingReward:
            return 'Reward payout';
        case SpecialTransactionType.Malformed:
            return 'Malformed';
        default:
            return 'Unknown';
    }
}

/** Convert transactions fetched from the wallet proxy into data format expected by the view.
Assumes 'transactions' are sorted by time in descending order.
 */
function convertToLogEntry(accountAddress: string, transactions: BrowserWalletTransaction[]): DayLogEntry[] {
    const dayLogs = [];
    let dayLog: DayLogEntry | undefined = undefined;
    for (const tx of transactions) {
        const dateTime = new Date(Number(tx.time * 1000n));
        const date = onlyDate(dateTime);
        const transactionLog: LogEntry = {
            key: tx.transactionHash,
            type: mapTypeToText(tx.type),
            income: tx.fromAddress !== accountAddress,
            amount: hasAmount(tx.type) ? displayAsCcd(tx.amount) : undefined,
            time: onlyTime(dateTime),
            info: tx.cost === undefined ? '' : `with fee ${displayAsCcd(tx.cost)}`,
            note: tx.memo,
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


type LogEntry = {
    key: string;
    type: string; // 'Unstaked amount',
    income: boolean;
    amount?: string; //10.02,
    time: string; // '11:24',
    info: string; // 'with fee 0.02 CCD',
    note?: string;
};

type DayLogEntry = {
    date: string; // '21 May 2024',
    total: string; // '4029.87',
    transactions: LogEntry[];
};


export default function TransactionLog() {
    const nav = useNavigate();
    const navToTransactionDetails = () => nav(relativeRoutes.home.transactionLog.details.path);
    const account = '3G5srtaeRvy2uzyaiheY3ZZ6nqTkDg1kRm59xWVnFo8CoEiZ6Y';
    const transactionList = useAccountTransactionList(account);
    const transactionLogs = useMemo(() => convertToLogEntry(account, transactionList), [transactionList]);

    return (
        <Page className="transaction-log">
            <Page.Top heading="Transaction log" />
            <Page.Main>
                <div className="transaction-log__history">
                    {transactionLogs.map((day) => (
                        <div key={day.date} className="transaction-log__history_day">
                            <div className="transaction-log__history_day-date">
                                <Text.CaptureAdditional>{day.date}</Text.CaptureAdditional>
                                {/*<Text.CaptureAdditional>${day.total}</Text.CaptureAdditional>*/}
                            </div>
                            {day.transactions.map((transaction) => (
                                <div
                                    key={`${day.date}_${transaction.time}`}
                                    className="transaction-log__history_transaction"
                                    onClick={navToTransactionDetails}
                                >
                                    <div className="transaction value">
                                        <Text.Label>{transaction.type}</Text.Label>
                                        <Text.Label className={transaction.income ? 'income' : ''}>
                                            {transaction.amount}
                                        </Text.Label>
                                    </div>
                                    <div className="transaction info">
                                        <Text.Capture>{transaction.time}</Text.Capture>
                                        <Text.Capture>{transaction.info}</Text.Capture>
                                    </div>
                                    {transaction.note && (
                                        <div className="transaction note">
                                            <Note />
                                            <Text.Capture>{transaction.note}</Text.Capture>
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    ))}
                </div>
            </Page.Main>
        </Page>
    );
}
