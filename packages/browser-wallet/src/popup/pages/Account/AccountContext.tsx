import { useAtomValue, useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import React, { useEffect, useMemo, useState, createContext, ReactNode } from 'react';
import { CreationStatus, WalletCredential } from '@shared/storage/types';
import { AccountInfo } from '@concordium/web-sdk';
import { networkConfigurationAtom } from '@popup/store/settings';
import { AccountInfoEmitter } from '@popup/shared/account-info-emitter';
import { addToastAtom } from '@popup/state';
import JSONBig from 'json-bigint';

function useAccountInfo(account?: WalletCredential) {
    const { t } = useTranslation('account');

    const [accountInfo, setAccountInfo] = useState<AccountInfo>();
    const { jsonRpcUrl } = useAtomValue(networkConfigurationAtom);
    const addToast = useSetAtom(addToastAtom);

    useEffect(() => {
        if (account?.status === CreationStatus.Confirmed) {
            const emitter = new AccountInfoEmitter(jsonRpcUrl);
            emitter.on('totalchanged', setAccountInfo);
            emitter.on('error', () => {
                addToast(t('accountBalanceError'));
            });
            emitter.listen([account.address]);
            return () => {
                emitter.removeAllListeners('totalchanged');
                emitter.removeAllListeners('error');
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
    account?: WalletCredential;
    children: ReactNode | undefined;
}

export default function AccountContextProvider({ account, children }: Props) {
    const accountInfo = useAccountInfo(account);
    const contextValues = useMemo(() => ({ accountInfo }), [JSONBig.stringify(accountInfo)]);

    return <accountContext.Provider value={contextValues}>{children}</accountContext.Provider>;
}
