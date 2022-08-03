import { useMemo } from 'react';
import groupBy from 'lodash.groupby';
import { TransactionElementInput } from './TransactionElement';

const dateFormat = Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format;
const dateFromTimeStamp = (timeStamp: bigint): Date => new Date(parseInt(timeStamp.toString(), 10) * 1000);

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

export type TransactionsByDateTuple = [string, TransactionElementInput[]];

export default function useTransactionGroups(transactions: TransactionElementInput[]): TransactionsByDateTuple[] {
    const transactionGroups = useMemo(
        () => Object.entries(groupBy(transactions, (t) => getGroupHeader(dateFromTimeStamp(t.time)))),
        [transactions]
    );

    return transactionGroups;
}
