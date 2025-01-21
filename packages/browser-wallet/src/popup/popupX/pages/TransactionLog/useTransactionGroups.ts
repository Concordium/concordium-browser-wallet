import { useMemo } from 'react';
import groupBy from 'lodash.groupby';
import { BrowserWalletTransaction } from '@popup/shared/utils/transaction-history-types';
import { dateFromTimestamp } from 'wallet-common-helpers';

/** Convert Date object to local string only showing the current date. */
const onlyDate = (date?: number | Date | undefined) =>
    `${Intl.DateTimeFormat(undefined, {
        day: '2-digit',
    }).format(date)} ${Intl.DateTimeFormat(undefined, {
        month: 'short',
        year: 'numeric',
    }).format(date)}`;

export type TransactionsByDateTuple = [string, BrowserWalletTransaction[]];

export default function useTransactionGroups(transactions: BrowserWalletTransaction[]): TransactionsByDateTuple[] {
    const transactionGroups = useMemo(
        () => Object.entries(groupBy(transactions, (t) => onlyDate(dateFromTimestamp(t.time)))),
        [transactions]
    );

    return transactionGroups;
}
