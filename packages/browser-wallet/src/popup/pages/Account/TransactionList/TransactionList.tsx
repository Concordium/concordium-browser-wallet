import { getTransactions } from '@shared/utils/wallet-proxy';
import React, { useEffect, useState } from 'react';
import InfiniteLoader from 'react-window-infinite-loader';
import { FixedSizeList as List } from 'react-window';
import { noOp } from 'wallet-common-helpers';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useAtomValue } from 'jotai';
import { selectedAccountAtom } from '@popup/store/account';
import TransactionElement, { TransactionElementInput } from './TransactionElement';

interface InfiniteTransactionListProps {
    transactions: TransactionElementInput[];
    hasNextPage: boolean;
    isNextPageLoading: boolean;
    loadNextPage: () => Promise<void>;
}

/**
 * An infinite scrolling list of transactions. Scrolling towards the bottom of the list
 * triggers loading the next page.
 */
function InfiniteTransactionList({
    transactions,
    loadNextPage,
    hasNextPage,
    isNextPageLoading,
}: InfiniteTransactionListProps) {
    const itemCount = hasNextPage ? transactions.length + 1 : transactions.length;
    const loadMoreItems = isNextPageLoading ? noOp : loadNextPage;
    const isItemLoaded = (index: number) => !hasNextPage || index < transactions.length;

    return (
        <AutoSizer>
            {({ height, width }) => (
                <InfiniteLoader isItemLoaded={isItemLoaded} itemCount={itemCount} loadMoreItems={loadMoreItems}>
                    {({ onItemsRendered, ref }) => (
                        <List
                            itemCount={transactions.length}
                            onItemsRendered={onItemsRendered}
                            ref={ref}
                            width={width}
                            height={height}
                            itemSize={58}
                        >
                            {({ index, style }) => {
                                if (!isItemLoaded(index)) {
                                    return <div style={style}>Loading</div>;
                                }
                                return (
                                    <TransactionElement
                                        style={style}
                                        key={transactions[index].key}
                                        transaction={transactions[index]}
                                    />
                                );
                            }}
                        </List>
                    )}
                </InfiniteLoader>
            )}
        </AutoSizer>
    );
}

/**
 * Displays a list of transactions from an account's transaction history.
 */
export default function TransactionList() {
    const accountAddress = useAtomValue(selectedAccountAtom);
    const [transactions, setTransactions] = useState<TransactionElementInput[]>([]);
    const [isNextPageLoading, setIsNextPageLoading] = useState<boolean>(false);
    const [hasNextPage, setHasNextPage] = useState<boolean>(true);

    if (!accountAddress) {
        return null;
    }

    useEffect(() => {
        setTransactions([]);
        getTransactions(accountAddress, 20, 'descending').then((transactionResult) => {
            setHasNextPage(transactionResult.full);
            setTransactions(transactionResult.transactions);
            setIsNextPageLoading(false);
        });
    }, [accountAddress]);

    const loadNextPage = async () => {
        setIsNextPageLoading(true);
        let fromId;
        if (transactions.length) {
            fromId = transactions[transactions.length - 1].id;
        }

        getTransactions(accountAddress, 20, 'descending', fromId)
            .then((transactionResult) => {
                setHasNextPage(transactionResult.full);
                setTransactions(transactions.concat(transactionResult.transactions));
                setIsNextPageLoading(false);
            })
            .catch((e) => {
                // TODO Handle exception when trying to get transactions.
                setIsNextPageLoading(false);
                throw Error(e);
            });
    };

    let transactionListComponent;
    if (transactions.length === 0) {
        if (isNextPageLoading) {
            transactionListComponent = <h3>Loading transactions</h3>;
        } else {
            transactionListComponent = (
                <h3 className="transaction-element__no-transactions">No transactions to show for account.</h3>
            );
        }
    } else {
        transactionListComponent = (
            <div className="transaction-list__scroll">
                <InfiniteTransactionList
                    transactions={transactions}
                    loadNextPage={loadNextPage}
                    hasNextPage={hasNextPage}
                    isNextPageLoading={isNextPageLoading}
                />
            </div>
        );
    }

    return <div className="transaction-list__container">{transactionListComponent}</div>;
}
