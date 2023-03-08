import { useAtomValue, useSetAtom, useAtom, atom, WritableAtom } from 'jotai';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { AccountAddress, AccountInfo } from '@concordium/web-sdk';
import { useTranslation } from 'react-i18next';
import i18next from 'i18next';
import { atomFamily } from 'jotai/utils';
import { noOp, parse, stringify } from 'wallet-common-helpers';
import { networkConfigurationAtom, grpcClientAtom } from '@popup/store/settings';
import { atomWithChromeStorage } from '@popup/store/utils';
import { ChromeStorageKey, CreationStatus, WalletCredential } from '@shared/storage/types';
import { addToastAtom } from '@popup/state';
import { getGenesisHash, sessionAccountInfoCache, useIndexedStorage } from '@shared/storage/access';
import { accountInfoCacheLock, updateRecord } from '@shared/storage/update';
import { AccountInfoListener } from '../account-info-listener';
import { useSelectedCredential } from '../utils/account-helpers';

const accountInfoBaseAtom = atomWithChromeStorage<Record<string, string>>(ChromeStorageKey.AccountInfoCache, {}, false);

type RefreshAction = {
    type: 'refresh';
    address: string;
};

type AccountInfoAction = RefreshAction;

export const accountInfoAtom = atom<Record<string, AccountInfo>, AccountInfoAction, Promise<void>>(
    (get) =>
        Object.entries(get(accountInfoBaseAtom)).reduce(
            (acc, [address, info]) => ({
                ...acc,
                [address]: info === undefined ? undefined : parse(info),
            }),
            {}
        ),
    async (get, set, update) => {
        const client = get(grpcClientAtom);
        const addToast = (v: string) => set(addToastAtom, v);

        try {
            const newAccountInfo = await client.getAccountInfo(new AccountAddress(update.address));

            if (newAccountInfo) {
                updateRecord(
                    accountInfoCacheLock,
                    useIndexedStorage(sessionAccountInfoCache, getGenesisHash),
                    newAccountInfo.accountAddress,
                    stringify(newAccountInfo)
                );
            }
        } catch {
            addToast(i18next.t('account.error'));
        }
    }
);

export const accountInfoFamily = atomFamily<string, WritableAtom<AccountInfo | undefined, void>>((address) =>
    atom(
        (get) => get(accountInfoAtom)[address],
        (_, set) => {
            set(accountInfoAtom, { type: 'refresh', address });
        }
    )
);
export const AccountInfoListenerContext = createContext<AccountInfoListener | undefined>(undefined);

interface Props {
    children: ReactNode;
}

export default function AccountInfoListenerContextProvider({ children }: Props) {
    const network = useAtomValue(networkConfigurationAtom);
    const addToast = useSetAtom(addToastAtom);
    const [accountInfoListener, setAccountInfoListener] = useState<AccountInfoListener>();
    const { t } = useTranslation();

    useEffect(() => {
        const listener = new AccountInfoListener(network);
        listener.listen();
        setAccountInfoListener(listener);
        const errorListener = () => addToast(t('account.error'));
        listener.on('error', errorListener);
        return () => {
            listener.removeListener('error', errorListener);
            listener.stop();
        };
    }, [network]);

    return (
        <AccountInfoListenerContext.Provider value={accountInfoListener}>
            {children}
        </AccountInfoListenerContext.Provider>
    );
}

/**
 * Gets the account info for an account, and keeps it in sync with the current
 * values on chain.
 *
 * N.B. has to be used inside an AccountInfoEmitterContext.
 */
export function useAccountInfo(account: WalletCredential): AccountInfo | undefined {
    const accountInfoEmitter = useContext<AccountInfoListener | undefined>(AccountInfoListenerContext);
    const [accountInfo, refreshAccountInfo] = useAtom(accountInfoFamily(account.address));
    const { genesisHash } = useAtomValue(networkConfigurationAtom);
    const address = useMemo(() => account.address, [account]);

    useEffect(() => {
        if (!accountInfo && account.status === CreationStatus.Confirmed) {
            refreshAccountInfo();
        }
    }, [genesisHash, accountInfo, account.status]);

    useEffect(() => {
        if (account.status === CreationStatus.Confirmed && accountInfoEmitter) {
            accountInfoEmitter.subscribe(address);
            return () => {
                accountInfoEmitter.unsubscribe(address);
            };
        }
        return noOp;
    }, [account, accountInfoEmitter]);

    return accountInfo;
}

export function useSelectedAccountInfo() {
    const cred = useSelectedCredential();

    if (cred === undefined) {
        return undefined;
    }

    return useAccountInfo(cred);
}
