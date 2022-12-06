import { BrowserWalletAccountTransaction, TransactionStatus } from '@popup/shared/utils/transaction-history-types';
import { atom, WritableAtom } from 'jotai';
import { atomFamily } from 'jotai/utils';
import { stringify, parse } from 'wallet-common-helpers';
import { ChromeStorageKey } from '@shared/storage/types';
import { loop } from '@shared/utils/function-helpers';
import { getTransactionStatus } from '@popup/shared/utils/wallet-proxy';
import { ACCOUNT_INFO_RETRIEVAL_INTERVAL_MS } from '@popup/shared/account-info-listener';
import { sessionPendingTransactions, useIndexedStorage } from '@shared/storage/access';
import { selectedAccountAtom } from './account';
import { atomWithChromeStorage } from './utils';
import { networkConfigurationAtom } from './settings';

const TRANSACTION_CHECK_INTERVAL = ACCOUNT_INFO_RETRIEVAL_INTERVAL_MS * 2;
const TRANSACTION_MONITOR_START_DELAY = 3000;

const monitoredMap: Record<string, string[]> = {};
const monitorTransactionStatus = (genesisHash: string) => {
    monitoredMap[genesisHash] = monitoredMap[genesisHash] ?? [];

    /**
     * Resolves with {status: TransactionCost; cost: bigint} if monitoring has started with this function invocation and false if transaction is already being monitored.
     */
    type R = false | { status: TransactionStatus; cost: bigint };
    return async (transactionHash: string): Promise<R> => {
        if (monitoredMap[genesisHash].some((th) => th === transactionHash)) {
            return false;
        }

        monitoredMap[genesisHash].push(transactionHash);

        let status: TransactionStatus | undefined;
        let cost: bigint | undefined;

        await loop(TRANSACTION_CHECK_INTERVAL, async () => {
            const response = await getTransactionStatus(transactionHash);
            const done =
                response !== undefined &&
                [TransactionStatus.Finalized, TransactionStatus.Failed].includes(response.status);

            if (done && response !== undefined) {
                monitoredMap[genesisHash] = monitoredMap[genesisHash].filter((th) => th !== transactionHash);
                status = response.status;
                cost = BigInt(response.cost);
            }

            return !done;
        });

        if (cost === undefined || status === undefined) {
            throw new Error('Unreachable'); // Unreachable block, validates variable types.
        }

        return { status, cost };
    };
};

const pendingTransactionsAtom = (() => {
    const baseAtom = atomWithChromeStorage<string[]>(ChromeStorageKey.PendingTransactions, []);
    const parsedAtom = atom<BrowserWalletAccountTransaction[], BrowserWalletAccountTransaction[], Promise<void>>(
        (get) => {
            const pending: BrowserWalletAccountTransaction[] = get(baseAtom).map(parse);
            return pending;
        },
        (_, set, update) => set(baseAtom, update.map(stringify))
    );

    const derived = atom<BrowserWalletAccountTransaction[], BrowserWalletAccountTransaction[], Promise<void>>(
        (get) => get(parsedAtom),
        async (get, set, update) => {
            const parsed = get(parsedAtom);
            const pending = [...parsed, ...update];

            if (update.length > 0) {
                await set(parsedAtom, pending);
            }

            const network = get(networkConfigurationAtom);
            const monitor = monitorTransactionStatus(network.genesisHash);

            pending
                .filter((p) => p.status === TransactionStatus.Pending)
                .forEach(async ({ transactionHash }) => {
                    const result = await monitor(transactionHash);
                    const currentNetwork = get(networkConfigurationAtom);

                    if (!result) {
                        return;
                    }

                    const networkChanged = network.genesisHash !== currentNetwork.genesisHash;

                    const mapIfMatch = (p: BrowserWalletAccountTransaction) =>
                        p.transactionHash !== transactionHash ? p : { ...p, ...result };

                    if (!networkChanged) {
                        const next = get(parsedAtom).map(mapIfMatch);
                        await set(parsedAtom, next);
                    } else {
                        const spt = useIndexedStorage(sessionPendingTransactions, async () => network.genesisHash);
                        const next = (await spt.get())?.map(parse).map(mapIfMatch);

                        await spt.set(next?.map(stringify) ?? []);
                    }
                });
        }
    );

    derived.onMount = (startMonitoring) => {
        // setAtom callback starts monitoring a list of transactions + pending transactions currently in store.
        setTimeout(() => startMonitoring([]), TRANSACTION_MONITOR_START_DELAY); // Give the base atom a little time to load stored value into memory.
    };

    return derived;
})();

const isForAccount = (address: string) => (transaction: BrowserWalletAccountTransaction) =>
    [transaction.fromAddress, transaction.toAddress].includes(address);

const pendingTransactionsFamily = atomFamily<
    string,
    WritableAtom<BrowserWalletAccountTransaction[], BrowserWalletAccountTransaction[], Promise<void>>
>((address) =>
    atom(
        (get) => get(pendingTransactionsAtom).filter(isForAccount(address)),
        (_, set, arg) => set(pendingTransactionsAtom, arg)
    )
);

export const selectedPendingTransactionsAtom = atom<BrowserWalletAccountTransaction[]>((get) => {
    const selectedAccount = get(selectedAccountAtom);
    if (selectedAccount === undefined) {
        return [];
    }

    return get(pendingTransactionsFamily(selectedAccount));
});

export const addPendingTransactionAtom = atom<null, BrowserWalletAccountTransaction, Promise<void>>(
    null,
    (get, set, transaction) => set(pendingTransactionsAtom, [...get(pendingTransactionsAtom), transaction])
);
