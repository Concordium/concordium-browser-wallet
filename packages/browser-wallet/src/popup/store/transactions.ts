import { BrowserWalletAccountTransaction } from '@popup/shared/utils/transaction-history-types';
import { ChromeStorageKey } from '@shared/storage/types';
import { atom, WritableAtom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { selectedAccountAtom } from './account';
import { atomWithChromeStorage } from './utils';

const pendingTransactionsAtom = atomWithChromeStorage<BrowserWalletAccountTransaction[]>(
    ChromeStorageKey.PendingTransactions,
    []
);

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

export const addPendingTransactionAtom = atom<null, BrowserWalletAccountTransaction>(null, (get, set, update) => {
    set(pendingTransactionsAtom, [...get(pendingTransactionsAtom), update]);
});

export const removePendingTransactionAtom = atom<null, BrowserWalletAccountTransaction>(null, (get, set, update) => {
    set(
        pendingTransactionsAtom,
        get(pendingTransactionsAtom).filter((t) => t.transactionHash === update.transactionHash)
    );
});
