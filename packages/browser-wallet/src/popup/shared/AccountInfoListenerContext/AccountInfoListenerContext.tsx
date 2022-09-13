import { AccountAddress, AccountInfo, HttpProvider, JsonRpcClient } from '@concordium/web-sdk';
import { networkConfigurationAtom } from '@popup/store/settings';
import { useAtomValue, useSetAtom } from 'jotai';
import React, { createContext, ReactNode, useContext, useEffect, useMemo, useState } from 'react';
import { atomWithChromeStorage } from '@popup/store/utils';
import { ChromeStorageKey, CreationStatus, WalletCredential } from '@shared/storage/types';
import { noOp, parse, stringify } from 'wallet-common-helpers';
import { addToastAtom } from '@popup/state';
import { useTranslation } from 'react-i18next';
import { getGenesisHash, sessionAccountInfoCache, useIndexedStorage } from '@shared/storage/access';
import { accountInfoCacheLock, updateRecord } from '@shared/storage/update';
import { AccountInfoListener } from '../account-info-listener';

export const accountInfoAtom = atomWithChromeStorage<Record<string, string>>(
    ChromeStorageKey.AccountInfoCache,
    {},
    false,
    true
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
    const accountInfoCache = useAtomValue(accountInfoAtom);
    const { genesisHash } = useAtomValue(networkConfigurationAtom);
    const address = useMemo(() => account.address, [account]);
    const addToast = useSetAtom(addToastAtom);
    const { jsonRpcUrl } = useAtomValue(networkConfigurationAtom);
    const { t } = useTranslation();
    const [accountInfo, setAccountInfo] = useState<AccountInfo>();

    useEffect(() => {
        if (accountInfoCache[address]) {
            setAccountInfo(parse(accountInfoCache[address]));
        } else if (account.status === CreationStatus.Confirmed) {
            const client = new JsonRpcClient(new HttpProvider(jsonRpcUrl));
            client
                .getConsensusStatus()
                .then((consensusStatus) => {
                    client
                        .getAccountInfo(new AccountAddress(address), consensusStatus.lastFinalizedBlock)
                        .then((newAccountInfo) => {
                            if (newAccountInfo) {
                                updateRecord(
                                    accountInfoCacheLock,
                                    useIndexedStorage(sessionAccountInfoCache, getGenesisHash),
                                    newAccountInfo.accountAddress,
                                    stringify(newAccountInfo)
                                );
                            }
                        })
                        .catch(() => addToast(t('account.error')));
                })
                .catch(() => addToast(t('account.error')));
        }
    }, [genesisHash, address, accountInfoCache[address]]);

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
