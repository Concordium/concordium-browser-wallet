import { useMemo } from 'react';
import groupBy from 'lodash.groupby';
import { BrowserWalletTransaction } from '@popup/shared/utils/transaction-history-types';
import { dateFromTimestamp } from 'wallet-common-helpers';

const dateFormat = Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format;

const getGroupHeader = (d: Date): string => {
    const today = new Date().toDateString();
    const yesterday = new Date(new Date().setDate(new Date().getDate() - 1)).toDateString();

    switch (d.toDateString()) {
        case today:
            return 'Today';
        case yesterday:
            return 'Yesterday';
        default:
            return dateFormat(d);
    }
};

export type TransactionsByDateTuple = [string, BrowserWalletTransaction[]];

export default function useTransactionGroups(transactions: BrowserWalletTransaction[]): TransactionsByDateTuple[] {
    const transactionGroups = useMemo(
        () => Object.entries(groupBy(transactions, (t) => getGroupHeader(dateFromTimestamp(t.time)))),
        [transactions]
    );

    return transactionGroups;
}
