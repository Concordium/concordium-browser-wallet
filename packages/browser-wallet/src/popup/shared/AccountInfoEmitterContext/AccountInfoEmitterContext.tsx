import { AccountAddress, AccountInfo, HttpProvider, JsonRpcClient } from '@concordium/web-sdk';
import { networkConfigurationAtom } from '@popup/store/settings';
import { useAtomValue, useSetAtom } from 'jotai';
import React, { createContext, ReactElement, useContext, useEffect, useMemo, useState } from 'react';
import JSONBig from 'json-bigint';
import { atomWithChromeStorage } from '@popup/store/utils';
import { ChromeStorageKey, CreationStatus, WalletCredential } from '@shared/storage/types';
import { noOp } from 'wallet-common-helpers';
import { addToastAtom } from '@popup/state';
import { useTranslation } from 'react-i18next';
import { AccountInfoEmitter } from '../account-info-emitter';

export const accountInfoAtom = atomWithChromeStorage<Record<string, string>>(
    ChromeStorageKey.AccountInfoCache,
    {},
    false,
    true
);
export const AccountInfoEmitterContext = createContext<AccountInfoEmitter | undefined>(undefined);

interface Props {
    children: ReactElement[];
}

export default function AccountInfoEmitterContextProvider({ children }: Props) {
    const network = useAtomValue(networkConfigurationAtom);
    const [accountInfoEmitter, setAccountInfoEmitter] = useState<AccountInfoEmitter>();

    useEffect(() => {
        const emitter = new AccountInfoEmitter(network.jsonRpcUrl);
        emitter.listen();
        setAccountInfoEmitter(emitter);
        return () => {
            emitter.stop();
        };
    }, [network]);

    return (
        <AccountInfoEmitterContext.Provider value={accountInfoEmitter}>{children}</AccountInfoEmitterContext.Provider>
    );
}

/**
 * Gets the account info for an account, and keeps it in sync with the current
 * values on chain.
 *
 * N.B. has to be used inside an AccountInfoEmitterContext.
 */
export function useAccountInfo(account: WalletCredential): AccountInfo | undefined {
    const accountInfoEmitter = useContext<AccountInfoEmitter | undefined>(AccountInfoEmitterContext);
    const accountInfoCache = useAtomValue(accountInfoAtom);
    const { genesisHash } = useAtomValue(networkConfigurationAtom);
    const address = useMemo(() => account.address, [account]);
    const addToast = useSetAtom(addToastAtom);
    const { jsonRpcUrl } = useAtomValue(networkConfigurationAtom);
    const { t } = useTranslation();

    const [accountInfo, setAccountInfo] = useState<AccountInfo>();

    useEffect(() => {
        if (accountInfoCache && accountInfoCache[address]) {
            setAccountInfo(JSONBig.parse(accountInfoCache[address]));
        } else {
            const client = new JsonRpcClient(new HttpProvider(jsonRpcUrl));
            client
                .getConsensusStatus()
                .then((consensusStatus) => {
                    client
                        .getAccountInfo(new AccountAddress(address), consensusStatus.lastFinalizedBlock)
                        .then((newAccountInfo) => {
                            setAccountInfo(newAccountInfo);
                        })
                        .catch(() => addToast(t('account.error')));
                })
                .catch(() => addToast(t('account.error')));
        }
    }, [genesisHash, address, accountInfoCache[address]]);

    useEffect(() => {
        if (account.status === CreationStatus.Confirmed && accountInfoEmitter) {
            const listener = accountInfoEmitter.subscribe(address, noOp);
            const errorListener = () => addToast(t('account.error'));
            accountInfoEmitter.on('error', errorListener);
            return () => {
                accountInfoEmitter.removeListener('error', errorListener);
                accountInfoEmitter.unsubscribe(address, listener);
            };
        }
        return () => noOp;
    }, [account, accountInfoEmitter]);

    return accountInfo;
}
