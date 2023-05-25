import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import { credentialsAtom, storedAllowListAtom } from '@popup/store/account';
import { useAtom, useAtomValue } from 'jotai';
import React, { useContext, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import ExternalRequestLayout from '@popup/page-layouts/ExternalRequestLayout';
import Button from '@popup/shared/Button';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import { displaySplitAddress } from '@popup/shared/utils/account-helpers';
import { WalletCredential } from '@shared/storage/types';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import AccountInfoListenerContextProvider from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { displayAsCcd } from 'wallet-common-helpers';
import { Checkbox } from '@popup/shared/Form/Checkbox';

type Props = {
    onAllow(): void;
    onReject(): void;
};

type ItemProps = {
    account: WalletCredential;
    identityName: string;
    onToggleChecked: () => void;
};

function AccountListItem({ account, identityName, onToggleChecked }: ItemProps) {
    const accountInfo = useAccountInfo(account);
    const totalBalance = useMemo(() => accountInfo?.accountAmount || 0n, [accountInfo?.accountAmount]);

    return (
        <div className="connect-accounts-request-accounts__account-item">
            <div className="connect-accounts-request-accounts__account-item__primary">
                <div className="flex align-center">{displaySplitAddress(account.address)} </div>
                <Checkbox
                    className="connect-accounts-request-accounts__account-item__check-box"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    onChange={onToggleChecked}
                />
            </div>
            <div className="connect-accounts-request-accounts__account-item__secondary">{identityName}</div>
            <div className="connect-accounts-request-accounts__account-item__secondary mono">
                {displayAsCcd(totalBalance)}
            </div>
        </div>
    );
}

export default function ConnectionRequest({ onAllow, onReject }: Props) {
    const { state } = useLocation();
    const { t } = useTranslation('connectionRequest');
    const { onClose, withClose } = useContext(fullscreenPromptContext);
    const [connectButtonDisabled, setConnectButtonDisabled] = useState<boolean>(false);
    const accounts = useAtomValue(credentialsAtom);
    const [allowListLoading, setAllowList] = useAtom(storedAllowListAtom);

    const [accountsToAdd, setAccountsToAdd] = useState<string[]>([]);

    useEffect(() => onClose(onReject), [onClose, onReject]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { url } = (state as any).payload;
    const urlDisplay = displayUrl(url);

    /**
     * Update the local state containing the list of account addresses
     * to be stored in the allowlist for the requesting dApp. If the address
     * is already present, then it is removed, if not present then it is added.
     * @param accountAddress the account address to add or remove from the list.
     */
    function updateAccountAddressChecked(accountAddress: string) {
        if (accountsToAdd.includes(accountAddress)) {
            const updatedAccounts = accountsToAdd.filter((acc) => acc !== accountAddress);
            setAccountsToAdd(updatedAccounts);
        } else {
            setAccountsToAdd([...accountsToAdd, accountAddress]);
        }
    }

    async function updateAllowList(url: string) {
        const updatedAllowList = {
            ...allowListLoading.value
        };

        updatedAllowList[url] = accountsToAdd;
        setAllowList(updatedAllowList);
    }

    return (
        <ExternalRequestLayout>
            <div className="h-full flex-column align-center">
                <header className="text-center">
                    <h3 className="m-v-5">{urlDisplay} wants to be added to your allowlist. Do you want to proceed?</h3>
                </header>
                <div className="connect-accounts-request">
                    <h3>Allowlisting a service</h3>
                    Allowlisting a service means that it can request identity proofs and signatures from selected
                    accounts.
                </div>
                <div className="connect-accounts-request-accounts">
                    <AccountInfoListenerContextProvider>
                        {accounts.map((account) => {
                            return <AccountListItem key={account.address} account={account} identityName="SomeName" onToggleChecked={() => updateAccountAddressChecked(account.address)}
                            />;
                        })}
                    </AccountInfoListenerContextProvider>
                </div>
                <div className="flex p-b-10  m-t-auto">
                    <Button width="narrow" className="m-r-10" onClick={withClose(onReject)}>
                        {t('actions.cancel')}
                    </Button>
                    <Button
                        width="narrow"
                        disabled={connectButtonDisabled}
                        onClick={() => {
                            setConnectButtonDisabled(true);
                            updateAllowList(new URL(url).origin).then(withClose(onAllow));
                        }}
                    >
                        {t('actions.connect')}
                    </Button>
                </div>
            </div>
        </ExternalRequestLayout>
    );
}
