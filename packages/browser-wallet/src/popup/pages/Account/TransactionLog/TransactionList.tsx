import { getTransactions } from '@popup/shared/utils/wallet-proxy';
import React, { createContext, forwardRef, Fragment, useContext, useEffect, useMemo, useState } from 'react';
import InfiniteLoader from 'react-window-infinite-loader';
import { VariableSizeList as List } from 'react-window';
import { noOp, PropsOf } from 'wallet-common-helpers';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useAtomValue } from 'jotai';
import { selectedAccountAtom } from '@popup/store/account';
import { BrowserWalletTransaction } from '@popup/shared/utils/transaction-history-types';
import TransactionElement, { transactionElementHeight } from './TransactionElement';
import useTransactionGroups, { TransactionsByDateTuple } from './useTransactionGroups';

const transactionHeaderHeight = 20;
const transactionResultLimit = 20;

interface InfiniteTransactionListProps {
    accountAddress: string;
    transactions: BrowserWalletTransaction[];
    hasNextPage: boolean;
    isNextPageLoading: boolean;
    loadNextPage: () => Promise<void>;
    onTransactionClick(transaction: BrowserWalletTransaction): void;
}

const isHeader = (item: string | BrowserWalletTransaction): item is string => typeof item === 'string';

interface StickyContextModel {
    groups: TransactionsByDateTuple[];
}
const StickyContext = createContext<StickyContextModel>({ groups: [] });

// eslint-disable-next-line react/display-name
const ListElement = forwardRef<HTMLDivElement, PropsOf<'div'>>(({ children, ...rest }, ref) => {
    const { groups } = useContext(StickyContext);

    return (
        <div ref={ref} {...rest}>
            {groups.map(([header, transactions]) => (
                <Fragment key={header}>
                    <span
                        className="transaction-list__scroll__transaction-group-header"
                        style={{ height: transactionHeaderHeight }}
                    >
                        {header}
                    </span>
                    <div
                        style={{
                            width: '100%',
                            paddingBottom: transactions.length * transactionElementHeight,
                        }}
                    />
                </Fragment>
            ))}
            {children}
        </div>
    );
});

const getKey = (item: string | BrowserWalletTransaction) =>
    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
    isHeader(item) ? item : item.transactionHash || item.id!;

/**
 * An infinite scrolling list of transactions. Scrolling towards the bottom of the list
 * triggers loading the next page.
 */
function InfiniteTransactionList({
    accountAddress,
    transactions,
    loadNextPage,
    hasNextPage,
    isNextPageLoading,
    onTransactionClick,
}: InfiniteTransactionListProps) {
    const groups = useTransactionGroups(transactions);
    const headersAndTransactions = groups.flat(2);
    const groupsContext = useMemo(() => {
        return { groups };
    }, [groups]);

    const itemCount = hasNextPage ? headersAndTransactions.length + 1 : headersAndTransactions.length;
    const loadMoreItems = isNextPageLoading ? noOp : loadNextPage;
    const isItemLoaded = (index: number) => !hasNextPage || index < headersAndTransactions.length;

    return (
        <StickyContext.Provider value={groupsContext}>
            <AutoSizer>
                {({ height, width }) => (
                    <InfiniteLoader isItemLoaded={isItemLoaded} itemCount={itemCount} loadMoreItems={loadMoreItems}>
                        {({ onItemsRendered, ref }) => (
                            <List
                                className="transaction-list__scroll__infinite"
                                itemCount={headersAndTransactions.length}
                                onItemsRendered={onItemsRendered}
                                ref={ref}
                                width={width}
                                height={height}
                                itemSize={(i) =>
                                    isHeader(headersAndTransactions[i])
                                        ? transactionHeaderHeight
                                        : transactionElementHeight
                                }
                                itemKey={(i) => getKey(headersAndTransactions[i])}
                                innerElementType={ListElement}
                            >
                                {({ index, style }) => {
                                    const item = headersAndTransactions[index];

                                    if (!isItemLoaded(index)) {
                                        return <div style={style}>Loading</div>;
                                    }

                                    if (isHeader(item)) {
                                        return (
                                            <span
                                                style={style}
                                                className="transaction-list__scroll__transaction-group-header-placeholder"
                                            />
                                        );
                                    }
                                    return (
                                        <TransactionElement
                                            accountAddress={accountAddress}
                                            style={style}
                                            key={item.transactionHash ?? item.id}
                                            transaction={item}
                                            onClick={() => onTransactionClick(item)}
                                        />
                                    );
                                }}
                            </List>
                        )}
                    </InfiniteLoader>
                )}
            </AutoSizer>
        </StickyContext.Provider>
    );
}

export interface TransactionListProps {
    onTransactionClick(transaction: BrowserWalletTransaction): void;
}

/**
 * Displays a list of transactions from an account's transaction history.
 */
export default function TransactionList({ onTransactionClick }: TransactionListProps) {
    const accountAddress = useAtomValue(selectedAccountAtom);
    const [transactions, setTransactions] = useState<BrowserWalletTransaction[]>([]);
    const [isNextPageLoading, setIsNextPageLoading] = useState<boolean>(false);
    const [hasNextPage, setHasNextPage] = useState<boolean>(true);

    if (!accountAddress) {
        return null;
    }

    async function loadTransactionsDescending(address: string, appendTransactions: boolean, fromId?: number) {
        setIsNextPageLoading(true);
        getTransactions(address, transactionResultLimit, 'descending', fromId)
            .then((transactionResult) => {
                setHasNextPage(transactionResult.full);
                const updatedTransactions = appendTransactions
                    ? transactions.concat(transactionResult.transactions)
                    : transactionResult.transactions;
                setTransactions(updatedTransactions);
                setIsNextPageLoading(false);
            })
            .catch((e) => {
                // TODO Handle exception when trying to get transactions.
                setIsNextPageLoading(false);
                throw Error(e);
            });
    }

    useEffect(() => {
        setTransactions([]);
        loadTransactionsDescending(accountAddress, false);
    }, [accountAddress]);

    const loadNextPage = async () => {
        let fromId;
        if (transactions.length) {
            fromId = transactions[transactions.length - 1].id;
        }
        loadTransactionsDescending(accountAddress, true, fromId);
    };

    let transactionListComponent;
    if (transactions.length === 0) {
        if (isNextPageLoading) {
            transactionListComponent = null;
        } else {
            transactionListComponent = (
                <h3 className="transaction-element__no-transactions">No transactions to show for account.</h3>
            );
        }
    } else {
        transactionListComponent = (
            <div className="transaction-list__scroll">
                <InfiniteTransactionList
                    accountAddress={accountAddress}
                    transactions={transactions}
                    loadNextPage={loadNextPage}
                    hasNextPage={hasNextPage}
                    isNextPageLoading={isNextPageLoading}
                    onTransactionClick={onTransactionClick}
                />
            </div>
        );
    }

    return <div className="transaction-list__container">{transactionListComponent}</div>;
}
