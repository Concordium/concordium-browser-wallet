import AccountInfoListenerContextProvider, { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import { displaySplitAddress } from '@popup/shared/utils/account-helpers';
import React, { useMemo } from 'react';
import { Checkbox } from '@popup/shared/Form/Checkbox';
import { WalletCredential } from '@shared/storage/types';
import { displayAsCcd } from 'wallet-common-helpers';
import { useAtomValue } from 'jotai';
import { credentialsAtom } from '@popup/store/account';

type ItemProps = {
    account: WalletCredential;
    identityName: string;
    checked: boolean;
    onToggleChecked: () => void;
};

function AccountListItem({ account, identityName, checked, onToggleChecked }: ItemProps) {
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
                    checked={checked}
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

export default function AllowlistEditor({
    selectedAccounts,
    setSelectedAccounts,
}: {
    selectedAccounts: string[];
    setSelectedAccounts: React.Dispatch<React.SetStateAction<string[]>>;
}) {
    const accounts = useAtomValue(credentialsAtom);

    /**
     * Update the local state containing the list of account addresses. If the address
     * is already present, then it is removed, if not present then it is added.
     * @param accountAddress the account address to add or remove from the list.
     */
    function updateAccountAddressChecked(accountAddress: string) {
        if (selectedAccounts.includes(accountAddress)) {
            const updatedAccounts = selectedAccounts.filter((acc) => acc !== accountAddress);
            setSelectedAccounts(updatedAccounts);
        } else {
            setSelectedAccounts([...selectedAccounts, accountAddress]);
        }
    }

    return (
        <div>
            <div className="connect-accounts-request">
                <h3>Allowlisting a service</h3>
                Allowlisting a service means that it can request identity proofs and signatures from selected accounts.
            </div>
            <div className="connect-accounts-request-accounts">
                <AccountInfoListenerContextProvider>
                    {accounts.map((account) => {
                        return (
                            <AccountListItem
                                key={account.address}
                                account={account}
                                identityName="SomeName"
                                checked={selectedAccounts.includes(account.address)}
                                onToggleChecked={() => updateAccountAddressChecked(account.address)}
                            />
                        );
                    })}
                </AccountInfoListenerContextProvider>
            </div>
        </div>
    );
}
