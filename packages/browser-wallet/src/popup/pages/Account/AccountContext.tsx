import { useAtomValue } from 'jotai';
import React, { useEffect, useMemo, useState, createContext, ReactElement } from 'react';
import { CreationStatus, WalletCredential, ConfirmedCredential } from '@shared/storage/types';
import { AccountInfo } from '@concordium/web-sdk';
import { networkConfigurationAtom } from '@popup/store/settings';
import { AccountInfoEmitter } from '@popup/shared/account-info-emitter';

function useAccountInfo(account?: WalletCredential) {
    const [accountInfo, setAccountInfo] = useState<AccountInfo>();
    const { jsonRpcUrl } = useAtomValue(networkConfigurationAtom);

    useEffect(() => {
        if (account?.status === CreationStatus.Confirmed) {
            const emitter = new AccountInfoEmitter(jsonRpcUrl);
            emitter.listen([account.address]);
            emitter.on('totalchanged', setAccountInfo);
            return () => {
                emitter.removeAllListeners('totalchanged');
                emitter.stop();
            };
        }
        return () => {};
    }, [account?.address, account?.status]);

    return accountInfo;
}

export type AccountContextValues = {
    accountInfo: AccountInfo | undefined;
};

export const accountContext = createContext<AccountContextValues>({ accountInfo: undefined });

interface Props {
    account: ConfirmedCredential;
    children: ReactElement;
}

export default function AccountContextProvider({ account, children }: Props) {
    const accountInfo = useAccountInfo(account);
    const contextValues = useMemo(() => ({ accountInfo }), [accountInfo]);

    return <accountContext.Provider value={contextValues}>{children}</accountContext.Provider>;
}
