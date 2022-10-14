import { getCcdDrop, getTransactions } from '@popup/shared/utils/wallet-proxy';
import React, { createContext, forwardRef, Fragment, useContext, useEffect, useMemo, useState } from 'react';
import InfiniteLoader from 'react-window-infinite-loader';
import { VariableSizeList as List } from 'react-window';
import { noOp, partition, PropsOf } from 'wallet-common-helpers';
import AutoSizer from 'react-virtualized-auto-sizer';
import { BrowserWalletTransaction } from '@popup/shared/utils/transaction-history-types';
import { useTranslation } from 'react-i18next';
import { addToastAtom } from '@popup/state';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import { useSelectedCredential } from '@popup/shared/utils/account-helpers';
import { useAtomValue, useSetAtom } from 'jotai';
import Button from '@popup/shared/Button';
import { networkConfigurationAtom } from '@popup/store/settings';
import { isMainnet } from '@shared/utils/network-helpers';
import { addPendingTransactionAtom, selectedPendingTransactionsAtom } from '@popup/store/transactions';
import { useUpdateAtom } from 'jotai/utils';
import useTransactionGroups, { TransactionsByDateTuple } from './useTransactionGroups';
import TransactionElement, { transactionElementHeight } from './TransactionElement';

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

/**
 * Update an existing list of descending transactions with a new list of ascending transactions,
 * ensuring that any overlaps are updated with the values from the new list of transactions.
 */
function updateTransactionsWithNewTransactions(
    existingTransactions: BrowserWalletTransaction[],
    newTransactions: BrowserWalletTransaction[]
) {
    const existingHashes = existingTransactions
        .filter((trx) => trx.transactionHash !== undefined)
        .map((trs) => trs.transactionHash);
    const transactionUpdates: Record<string, BrowserWalletTransaction> = {} as Record<string, BrowserWalletTransaction>;

    const [existing, allNew] = partition(newTransactions, (transaction) =>
        existingHashes.includes(transaction.transactionHash)
    );
    existing.forEach((element) => {
        transactionUpdates[element.transactionHash] = element;
    });

    // Update the existing transactions and save in a new array.
    const updatedExistingTransactions = [...existingTransactions].map((existingTransaction) => {
        if (transactionUpdates[existingTransaction.transactionHash]) {
            return transactionUpdates[existingTransaction.transactionHash];
        }
        return existingTransaction;
    });

    return [...allNew.reverse(), ...updatedExistingTransactions];
}

export interface TransactionListProps {
    onTransactionClick(transaction: BrowserWalletTransaction): void;
}

/**
 * Displays a list of transactions from an account's transaction history.
 */
export default function TransactionList({ onTransactionClick }: TransactionListProps) {
    const { t } = useTranslation('transactionLog');
    const account = useSelectedCredential();
    const accountAddress = useMemo(() => account?.address, [account]);
    const pendingTransactions = useAtomValue(selectedPendingTransactionsAtom);
    const addPendingTransaction = useUpdateAtom(addPendingTransactionAtom);
    const [transactions, setTransactions] = useState<BrowserWalletTransaction[]>([]);
    const allTransactions = useMemo(
        () => [
            ...pendingTransactions.filter(
                (ta) => !transactions.some((tb) => ta.transactionHash === tb.transactionHash)
            ),
            ...transactions,
        ],
        [transactions, pendingTransactions]
    );
    const [isNextPageLoading, setIsNextPageLoading] = useState<boolean>(false);
    const [hasNextPage, setHasNextPage] = useState<boolean>(true);
    const addToast = useSetAtom(addToastAtom);
    const [amount, setAmount] = useState<bigint>();
    const network = useAtomValue(networkConfigurationAtom);
    const [disableCcdDropButton, setDisableCcdDropButton] = useState<boolean>(false);

    if (!account || !accountAddress) {
        return null;
    }

    const accountInfo = useAccountInfo(account);

    async function getNewTransactions() {
        if (accountAddress) {
            let more = true;
            let fromId = transactions.length > 0 ? transactions[0].id : undefined;
            let newTransactions: BrowserWalletTransaction[] = [];
            while (more) {
                try {
                    const result = await getTransactions(accountAddress, transactionResultLimit, 'ascending', fromId);
                    newTransactions = [...newTransactions, ...result.transactions];
                    fromId = newTransactions.length > 0 ? newTransactions[newTransactions.length - 1].id : fromId;
                    more = result.full;
                } catch {
                    addToast(t('error'));
                    return;
                }
            }

            const updatedTransactions = updateTransactionsWithNewTransactions(transactions, newTransactions);
            setTransactions(updatedTransactions);
        }
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
            .catch(() => {
                addToast(t('error'));
                setIsNextPageLoading(false);
            });
    }

    const loadNextPage = async () => {
        let fromId;
        if (transactions.length) {
            fromId = transactions[transactions.length - 1].id;
        }
        loadTransactionsDescending(accountAddress, true, fromId);
    };

    useEffect(() => {
        setTransactions([]);
        loadTransactionsDescending(accountAddress, false);
        setAmount(undefined);
        setDisableCcdDropButton(false);
    }, [accountAddress]);

    useEffect(() => {
        if (amount !== undefined && accountInfo?.accountAmount !== undefined && accountInfo?.accountAmount !== amount) {
            getNewTransactions();
        }
        setAmount(accountInfo?.accountAmount);
    }, [accountInfo?.accountAmount]);

    function ccdDrop(address: string) {
        getCcdDrop(address).then(addPendingTransaction);
    }

    let transactionListComponent;
    if (allTransactions.length === 0) {
        if (isNextPageLoading) {
            transactionListComponent = null;
        } else {
            // If a test network then display button.
            transactionListComponent = (
                <div className="transaction-element__no-transactions">
                    <p>{t('noTransactions')}</p>
                    {!isMainnet(network) && (
                        <Button
                            width="wide"
                            disabled={disableCcdDropButton}
                            onClick={() => {
                                setDisableCcdDropButton(true);
                                ccdDrop(accountAddress);
                            }}
                        >
                            Request CCD
                        </Button>
                    )}
                </div>
            );
        }
    } else {
        // Quick and dirty fingerprint of transactions, to ensure transaction list resets properly.
        const listKey = `${allTransactions.length}${allTransactions.reduce((acc, cur) => (acc + cur.id) % 73, 0)}`;

        transactionListComponent = (
            <div className="transaction-list__scroll">
                <InfiniteTransactionList
                    key={listKey}
                    accountAddress={accountAddress}
                    transactions={allTransactions}
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
