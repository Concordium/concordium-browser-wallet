import { BrowserWalletAccountTransaction } from '@popup/shared/utils/transaction-history-types';
import { makeStorageAccessor } from './access';
import { ChromeStorageKey, StoredBrowserWalletTransaction } from './types';

export const pendingTransactions = makeStorageAccessor<StoredBrowserWalletTransaction[]>(
    'local',
    ChromeStorageKey.PendingTransactions
);

export const fromStoredTransaction = (t: StoredBrowserWalletTransaction): BrowserWalletAccountTransaction => ({
    ...t,
    time: BigInt(t.time),
    amount: BigInt(t.amount),
    cost: t.cost === undefined ? undefined : BigInt(t.cost),
});

export const toStoredTransaction = (t: BrowserWalletAccountTransaction): StoredBrowserWalletTransaction => ({
    ...t,
    time: t.time.toString(),
    amount: t.amount.toString(),
    cost: t.cost?.toString(),
});
