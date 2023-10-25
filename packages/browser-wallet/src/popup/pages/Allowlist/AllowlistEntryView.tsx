import AccountInfoListenerContextProvider, { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import { displaySplitAddress, useIdentityName } from '@popup/shared/utils/account-helpers';
import React, { useMemo, useState } from 'react';
import { Checkbox } from '@popup/shared/Form/Checkbox';
import { WalletCredential } from '@shared/storage/types';
import { displayAsCcd } from 'wallet-common-helpers';
import { useAtomValue } from 'jotai';
import { credentialsAtom } from '@popup/store/account';
import { useTranslation } from 'react-i18next';

type ItemProps = {
    account: WalletCredential;
    checked: boolean;
    onToggleChecked: () => void;
};

function AccountListItem({ account, checked, onToggleChecked }: ItemProps) {
    const accountInfo = useAccountInfo(account);
    const identityName = useIdentityName(account, 'Identity');
    const totalBalance = useMemo(
        () => accountInfo?.accountAmount.microCcdAmount || 0n,
        [accountInfo?.accountAmount.microCcdAmount]
    );

    return (
        <div className="allowlist-entry-view__accounts__item">
            <div className="allowlist-entry-view__accounts__item__primary">
                <div className="flex align-center">{displaySplitAddress(account.address)} </div>
                <Checkbox
                    className="allowlist-entry-view__accounts__item__check-box"
                    onClick={(e) => {
                        e.stopPropagation();
                    }}
                    checked={checked}
                    onChange={onToggleChecked}
                />
            </div>
            <div className="allowlist-entry-view__accounts__item__secondary">{identityName}</div>
            <div className="allowlist-entry-view__accounts__item__secondary mono">{displayAsCcd(totalBalance)}</div>
        </div>
    );
}

export enum AllowlistMode {
    Add,
    Modify,
}

export interface Props {
    initialSelectedAccounts: string[];
    mode: AllowlistMode;
    onChange?: (selectedAccounts: string[]) => void;
}

export default function AllowlistEntryView({ initialSelectedAccounts, mode, onChange }: Props) {
    const { t } = useTranslation('allowlist', { keyPrefix: 'entry' });
    const [selectedAccounts, setSelectedAccounts] = useState<string[]>(initialSelectedAccounts);
    const accounts = useAtomValue(credentialsAtom);

    /**
     * Update the local state containing the list of account addresses. If the address
     * is already present, then it is removed, if not present then it is added. The onChange
     * callback is called with the new list of selected account addresses.
     * @param accountAddress the account address to add or remove from the list.
     */
    function updateAccountAddressChecked(accountAddress: string) {
        let updatedSelectedAccounts = [];
        if (selectedAccounts.includes(accountAddress)) {
            updatedSelectedAccounts = selectedAccounts.filter((acc) => acc !== accountAddress);
        } else {
            updatedSelectedAccounts = [...selectedAccounts, accountAddress];
        }

        setSelectedAccounts(updatedSelectedAccounts);
        if (onChange) {
            onChange(updatedSelectedAccounts);
        }
    }

    return (
        <AccountInfoListenerContextProvider>
            <div>
                <div className="allowlist-entry-view__header">
                    <h3>{t('header')}</h3>
                    {t('description')}
                    <div className="allowlist-entry-view__mode-description ">
                        {mode === AllowlistMode.Add ? <div>{t('addDescription')}</div> : null}
                        {mode === AllowlistMode.Modify ? <div>{t('modifyDescription')}</div> : null}
                    </div>
                </div>
                <div className="allowlist-entry-view__accounts">
                    {accounts.map((account) => {
                        return (
                            <AccountListItem
                                key={account.address}
                                account={account}
                                checked={selectedAccounts.includes(account.address)}
                                onToggleChecked={() => updateAccountAddressChecked(account.address)}
                            />
                        );
                    })}
                </div>
            </div>
        </AccountInfoListenerContextProvider>
    );
}
