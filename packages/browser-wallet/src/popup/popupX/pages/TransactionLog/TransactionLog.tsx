import React, { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import InfiniteLoader from 'react-window-infinite-loader';
import { VariableSizeList as List } from 'react-window';
import { useTranslation } from 'react-i18next';
import { noOp, partition } from 'wallet-common-helpers';
import AutoSizer from 'react-virtualized-auto-sizer';
import { useAtomValue, useSetAtom } from 'jotai';
import { useUpdateAtom } from 'jotai/utils';

import { getCcdDrop, getTransactions } from '@popup/shared/utils/wallet-proxy';
import { BrowserWalletTransaction } from '@popup/shared/utils/transaction-history-types';
import { addToastAtom } from '@popup/state';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import Button from '@popup/popupX/shared/Button';
import { networkConfigurationAtom } from '@popup/store/settings';
import { isMainnet } from '@shared/utils/network-helpers';
import { addPendingTransactionAtom, selectedPendingTransactionsAtom } from '@popup/store/transactions';
import { WalletCredential } from '@shared/storage/types';
import Text from '@popup/popupX/shared/Text';
import Page from '@popup/popupX/shared/Page';
import { useCredential } from '@popup/shared/utils/account-helpers';
import { relativeRoutes } from '@popup/popupX/constants/routes';
import { mainLayoutScrollContext } from '@popup/popupX/page-layouts/MainLayout/MainLayout';

import useTransactionGroups, { TransactionLogParams } from './util';
import TransactionElement, { TRANSACTION_ELEMENT_HEIGHT } from './TransactionElement';
import { TransactionDetailsLocationState } from './TransactionDetails/TransactionDetails';

// Needs to stay in sync with the sizes of the respective elements.
const TITLE_HEIGHT = 30;
const LIST_HEADER_HEIGHT = 36;
const TRANSACTIONS_LIMIT = 20;

interface InfiniteTransactionListProps {
    accountAddress: string;
    transactions: BrowserWalletTransaction[];
    hasNextPage: boolean;
    isNextPageLoading: boolean;
    loadNextPage: () => Promise<void>;
    onTransactionClick(transaction: BrowserWalletTransaction): void;
}

const isHeader = (item: string | BrowserWalletTransaction): item is string => typeof item === 'string';

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
    const { t } = useTranslation('x', { keyPrefix: 'transactionLogX' });
    const groups = useTransactionGroups(transactions);
    const headersAndTransactions = [t('title'), ...groups.flat(2)];
    const { setScroll } = useContext(mainLayoutScrollContext);

    const itemCount = hasNextPage ? headersAndTransactions.length + 1 : headersAndTransactions.length;
    const loadMoreItems = isNextPageLoading ? noOp : loadNextPage;
    const isItemLoaded = (index: number) => !hasNextPage || index < headersAndTransactions.length;

    useEffect(() => {
        return () => {
            setScroll(0);
        };
    }, []);

    return (
        <AutoSizer>
            {({ height, width }) => (
                <InfiniteLoader isItemLoaded={isItemLoaded} itemCount={itemCount} loadMoreItems={loadMoreItems}>
                    {({ onItemsRendered, ref }) => (
                        <List
                            className="transaction-log__history"
                            itemCount={headersAndTransactions.length}
                            onItemsRendered={onItemsRendered}
                            ref={ref}
                            width={width}
                            height={height}
                            onScroll={(e) => setScroll(e.scrollOffset)}
                            itemSize={(i) => {
                                if (i === 0) return TITLE_HEIGHT;
                                return isHeader(headersAndTransactions[i])
                                    ? LIST_HEADER_HEIGHT
                                    : TRANSACTION_ELEMENT_HEIGHT;
                            }}
                            itemKey={(i) => (i === 0 ? 'title' : getKey(headersAndTransactions[i]))}
                        >
                            {({ index, style }) => {
                                if (!isItemLoaded(index)) {
                                    return <div style={style}>...</div>;
                                }

                                const item = headersAndTransactions[index];
                                if (index === 0 && isHeader(item)) {
                                    return <Text.Heading style={style}>{item}</Text.Heading>;
                                }
                                if (isHeader(item)) {
                                    return (
                                        <Text.CaptureAdditional className="transaction-log__date" style={style}>
                                            {item}
                                        </Text.CaptureAdditional>
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
    account: WalletCredential;
    onTransactionClick(transaction: BrowserWalletTransaction): void;
}

/**
 * Displays a list of transactions from an account's transaction history.
 */
function TransactionList({ onTransactionClick, account }: TransactionListProps) {
    const { t } = useTranslation('x', { keyPrefix: 'transactionLogX' });
    const accountAddress = useMemo(() => account.address, [account]);
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
    const accountChanged = useRef(true);
    const accountInfo = useAccountInfo(account);

    async function getNewTransactions() {
        if (accountAddress) {
            let more = true;
            let fromId = transactions.length > 0 ? transactions[0].id : undefined;
            let newTransactions: BrowserWalletTransaction[] = [];
            while (more) {
                try {
                    const result = await getTransactions(accountAddress, TRANSACTIONS_LIMIT, 'ascending', {
                        from: fromId,
                    });
                    newTransactions = [...newTransactions, ...result.transactions];
                    fromId = newTransactions.length > 0 ? newTransactions[newTransactions.length - 1].id : fromId;
                    more = result.full;
                } catch {
                    addToast(t('list.error'));
                    return;
                }
            }

            const updatedTransactions = updateTransactionsWithNewTransactions(transactions, newTransactions);
            setTransactions(updatedTransactions);
        }
    }

    async function loadTransactionsDescending(address: string, appendTransactions: boolean, fromId?: number) {
        setIsNextPageLoading(true);
        return getTransactions(address, TRANSACTIONS_LIMIT, 'descending', { from: fromId })
            .then((transactionResult) => {
                setHasNextPage(transactionResult.full);

                const updatedTransactions = appendTransactions
                    ? transactions.concat(transactionResult.transactions)
                    : transactionResult.transactions;

                setTransactions(updatedTransactions);
                setIsNextPageLoading(false);
            })
            .catch(() => {
                addToast(t('list.error'));
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
        setAmount(undefined);
        setDisableCcdDropButton(false);

        accountChanged.current = true;
        loadTransactionsDescending(accountAddress, false).then(() => {
            accountChanged.current = false;
        });
    }, [accountAddress]);

    useEffect(() => {
        if (
            !accountChanged.current &&
            amount !== undefined &&
            accountInfo?.accountAmount !== undefined &&
            accountInfo?.accountAmount.microCcdAmount !== amount
        ) {
            getNewTransactions();
        }
        setAmount(accountInfo?.accountAmount.microCcdAmount);
    }, [accountInfo?.accountAmount]);

    function ccdDrop(address: string) {
        getCcdDrop(address).then(addPendingTransaction);
    }

    if (allTransactions.length === 0) {
        if (isNextPageLoading || hasNextPage) {
            return null;
        }

        // If a test network then display button.
        return (
            <Page>
                <Page.Top heading={t('title')} />
                <Page.Main>{t('list.noTransactions')}</Page.Main>
                {!isMainnet(network) && (
                    <Page.Footer>
                        <Button.Main
                            label={t('list.requestCcd')}
                            disabled={disableCcdDropButton}
                            onClick={() => {
                                setDisableCcdDropButton(true);
                                ccdDrop(accountAddress);
                            }}
                        />
                    </Page.Footer>
                )}
            </Page>
        );
    }

    const txKey = transactions[0]?.transactionHash || transactions[0]?.id || '';
    const listKey = `${accountAddress}${txKey}`;

    return (
        <Page className="transaction-log">
            <Page.Main className="flex-child-fill">
                <InfiniteTransactionList
                    key={listKey}
                    accountAddress={accountAddress}
                    transactions={allTransactions}
                    loadNextPage={loadNextPage}
                    hasNextPage={hasNextPage}
                    isNextPageLoading={isNextPageLoading}
                    onTransactionClick={onTransactionClick}
                />
            </Page.Main>
        </Page>
    );
}

export default function Loader() {
    const params = useParams<TransactionLogParams>();
    const account = useCredential(params.account);
    const nav = useNavigate();

    if (account === undefined) {
        // No account address in the path.
        return <Navigate to="../" />;
    }

    const navToTransactionDetails = (transaction: BrowserWalletTransaction) => {
        const state: TransactionDetailsLocationState = {
            transaction,
        };
        nav(relativeRoutes.home.transactionLog.details.path, { state });
    };

    return <TransactionList account={account} onTransactionClick={navToTransactionDetails} />;
}
