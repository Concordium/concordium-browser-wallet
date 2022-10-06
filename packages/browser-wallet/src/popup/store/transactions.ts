import {
    BrowserWalletAccountTransaction,
    BrowserWalletTransaction,
} from '@popup/shared/utils/transaction-history-types';
import { fromStoredTransaction, toStoredTransaction } from '@shared/storage/transactions';
import { ChromeStorageKey, StoredBrowserWalletTransaction } from '@shared/storage/types';
import { atom, WritableAtom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { selectedAccountAtom } from './account';
import { atomWithChromeStorage } from './utils';

const pendingTransactionsAtom = (() => {
    const base = atomWithChromeStorage<StoredBrowserWalletTransaction[]>(ChromeStorageKey.PendingTransactions, []);

    return atom<BrowserWalletAccountTransaction[], BrowserWalletAccountTransaction[]>(
        (get) => get(base).map(fromStoredTransaction),
        (_, set, update) => {
            set(base, update.map(toStoredTransaction));
        }
    );
})();

const isForAccount = (address: string) => (transaction: BrowserWalletAccountTransaction) =>
    [transaction.fromAddress, transaction.toAddress].includes(address);

const pendingTransactionsFamily = atomFamily<
    string,
    WritableAtom<BrowserWalletAccountTransaction[], BrowserWalletAccountTransaction[]>
>((address) =>
    atom(
        (get) => get(pendingTransactionsAtom).filter(isForAccount(address)),
        (_, set, arg) => {
            set(pendingTransactionsAtom, arg);
        }
    )
);

export const selectedPendingTransactionsAtom = atom<
    BrowserWalletAccountTransaction[],
    BrowserWalletAccountTransaction[]
>(
    (get) => {
        const selectedAccount = get(selectedAccountAtom);
        if (selectedAccount === undefined) {
            return [];
        }

        return get(pendingTransactionsFamily(selectedAccount));
    },
    (get, set, update) => {
        const selectedAccount = get(selectedAccountAtom);
        if (selectedAccount !== undefined) {
            set(pendingTransactionsFamily(selectedAccount), update);
        }
    }
);

export const addPendingTransactionAtom = atom<null, BrowserWalletAccountTransaction>(null, (get, set, transaction) => {
    set(pendingTransactionsAtom, [...get(pendingTransactionsAtom), transaction]);
});

export const removePendingTransactionsAtom = atom<null, BrowserWalletTransaction[]>(null, (get, set, transactions) => {
    const current = get(pendingTransactionsAtom);
    const next = current.filter((ta) => !transactions.some((tb) => ta.transactionHash === tb.transactionHash));

    if (current.length !== next.length) {
        set(pendingTransactionsAtom, next);
    }
});
