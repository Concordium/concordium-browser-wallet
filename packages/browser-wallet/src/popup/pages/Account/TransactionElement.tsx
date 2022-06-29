import SidedRow from '@popup/shared/SidedRow';
import React, { useEffect, useState } from 'react';
import DoubleCheckmarkIcon from '@assets/svg/double-grey-checkmark.svg';
import { displayAsCcd } from 'wallet-common-helpers/lib/utils/ccd';
import InfiniteLoader from 'react-window-infinite-loader';
import { FixedSizeList } from 'react-window';
import { getTransactions } from '@shared/utils/wallet-proxy';
import { noOp } from 'wallet-common-helpers';

interface Props {
    transaction: TransactionElementInput;
}

export interface TransactionHistoryResult {
    full: boolean;
    transactions: TransactionElementInput[];
}

export interface TransactionElementInput {
    fromAddress: string;
    toAddress: string | undefined;
    transactionHash: string;
    blockHash: string;
    amount: bigint;
    cost?: bigint;
    type: string;
    status: TransactionStatus;
    time: bigint;
    key: string;
    id: number;
}

// TODO Move all this to shared library.
type DatePartFormatters = { [key in keyof DateParts]: (v?: string) => string };

export const ensureNumberLength =
    (length: number) =>
    (value?: string): string => {
        if (!value) {
            return '';
        }

        const valueLength = value.length;

        if (valueLength >= length) {
            return value;
        }

        const missing = length - valueLength;
        const prepend = new Array(missing).fill(`0`).join('');

        return `${prepend}${value}`;
    };

export const datePartFormatters: DatePartFormatters = {
    year: ensureNumberLength(4),
    month: ensureNumberLength(2),
    date: ensureNumberLength(2),
    hours: ensureNumberLength(2),
    minutes: ensureNumberLength(2),
    seconds: ensureNumberLength(2),
};

export interface DateParts {
    year: string;
    month: string;
    date: string;
    hours: string;
    minutes: string;
    seconds: string;
}

export function datePartsFromDate(date?: Date): DateParts | undefined {
    if (!date) {
        return undefined;
    }

    return {
        year: `${date.getFullYear()}`,
        month: `${date.getMonth() + 1}`,
        date: `${date.getDate()}`,
        hours: `${date.getHours()}`,
        minutes: `${date.getMinutes()}`,
        seconds: `${date.getSeconds()}`,
    };
}

// TODO Move to common repository
export const getFormattedDateString = (date: Date): string => {
    const parts = datePartsFromDate(date);

    if (!parts) {
        return '';
    }

    const p: DateParts = (Object.keys(parts) as Array<keyof DateParts>).reduce<DateParts>(
        (acc, k) => ({
            ...acc,
            [k]: datePartFormatters[k](parts[k]),
        }),
        {} as DateParts
    );

    const { year, month, date: d, hours, minutes, seconds } = p;

    return `${year}-${month}-${d} at ${hours}:${minutes}:${seconds}`;
};

/**
 * Units of Time for the unix timestamp.
 * Values are set so that (time in unit) * unit = (time in milliseconds)
 */
export enum TimeStampUnit {
    seconds = 1e3,
    milliSeconds = 1,
}

export const dateFromTimeStamp = (timeStamp: string | bigint, unit: TimeStampUnit = TimeStampUnit.seconds): Date =>
    new Date(parseInt(timeStamp.toString(), 10) * unit);

/**
 * Given a unix timeStamp, return the date and time in a displayable format.
 * Assumes the timestamp is in seconds, otherwise the unit should be specified.
 */
export function parseTime(timeStamp: string | bigint, unit?: TimeStampUnit) {
    return getFormattedDateString(dateFromTimeStamp(timeStamp, unit));
}

const onlyTime = Intl.DateTimeFormat(undefined, {
    timeStyle: 'medium',
    hourCycle: 'h23',
}).format;

export enum TransactionStatus {
    /** On-chain but with an error */
    Failed = 'failed',
    /** On-chain and successful */
    Finalized = 'finalized',
}

function statusIcon(status: TransactionStatus) {
    switch (status) {
        case TransactionStatus.Failed:
        case TransactionStatus.Finalized:
            return <DoubleCheckmarkIcon className="transaction-element__checkmark" />;
        default:
            throw new Error(`Received an unsupported status: ${status}`);
    }
}
/**
 * Constructs a displayable string of the fee for a transaction.
 * @param cost the transaction cost
 * @returns a displayable string of the fee for a transaction in CCD.
 */
function buildFeeString(cost: bigint) {
    return `${displayAsCcd(cost)} Fee`;
}

interface TransactionListProps {
    accountAddress: string;
}

/**
 * A transaction element to be used in transaction list.
 */
export default function TransactionElement({ transaction }: Props) {
    const transactionTime = onlyTime(dateFromTimeStamp(transaction.time, TimeStampUnit.seconds));

    return (
        <div className="transaction-element" tabIndex={0} role="button">
            <SidedRow
                left={transaction.type}
                right={
                    <p className="transaction-element__amount">
                        {displayAsCcd(transaction.cost ? transaction.amount - transaction.cost : transaction.amount)}
                    </p>
                }
            />
            <SidedRow
                className="transaction-element__text-faded m-r-15"
                left={
                    <>
                        {transactionTime} {statusIcon(transaction.status)}
                    </>
                }
                right={transaction.cost !== undefined ? buildFeeString(transaction.cost) : ''}
            />
        </div>
    );
}

interface InfiniteTransactionListProps {
    transactions: TransactionElementInput[];
    hasNextPage: boolean;
    isNextPageLoading: boolean;
    loadNextPage: (startIndex: number, stopIndex: number) => Promise<void>;
}

function InfiniteTransactionList({
    transactions,
    loadNextPage,
    hasNextPage,
    isNextPageLoading,
}: InfiniteTransactionListProps): JSX.Element {
    const itemCount = hasNextPage ? transactions.length + 1 : transactions.length;
    const loadMoreItems = isNextPageLoading ? noOp : loadNextPage;
    const isItemLoaded = (index: number) => !hasNextPage || index < transactions.length;

    return (
        <InfiniteLoader isItemLoaded={isItemLoaded} itemCount={itemCount} loadMoreItems={loadMoreItems}>
            {({ onItemsRendered, ref }) => (
                <FixedSizeList
                    itemCount={itemCount}
                    onItemsRendered={onItemsRendered}
                    ref={ref}
                    width={354}
                    height={290}
                    itemSize={58}
                >
                    {({ index }) => {
                        if (!isItemLoaded(index)) {
                            return <div>Loading</div>;
                        }
                        return <TransactionElement key={transactions[index].key} transaction={transactions[index]} />;
                    }}
                </FixedSizeList>
            )}
        </InfiniteLoader>
    );
}

export function TransactionList({ accountAddress }: TransactionListProps): JSX.Element {
    const [transactions, setTransactions] = useState<TransactionElementInput[]>([]);
    const [isNextPageLoading, setIsNextPageLoading] = useState<boolean>(false);
    const [hasNextPage, setHasNextPage] = useState<boolean>(true);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const loadNextPage = async (startIndex: number, stopIndex: number) => {
        setIsNextPageLoading(true);
        let fromId;
        if (transactions.length) {
            fromId = transactions[transactions.length - 1].id;
        }

        getTransactions(accountAddress, 5, 'descending', fromId)
            .then((transactionResult) => {
                setHasNextPage(transactionResult.full);
                setTransactions(transactions.concat(transactionResult.transactions));
                setIsNextPageLoading(false);
            })
            .catch(() => {
                // TODO Handle exception when trying to get transactions.
                setIsNextPageLoading(false);
            });
    };

    useEffect(() => {
        loadNextPage(0, 10);
    }, [accountAddress]);

    // TODO Avoid flashing this text before transactions have been loaded.
    if (transactions.length === 0) {
        return <h3 className="transaction-element__no-transactions">No transactions to show for account.</h3>;
    }

    return (
        <div className="account-page__transaction-element-list__scroll">
            <InfiniteTransactionList
                transactions={transactions}
                loadNextPage={loadNextPage}
                hasNextPage={hasNextPage}
                isNextPageLoading={isNextPageLoading}
            />
        </div>
    );
}
