import React, { useMemo, useState } from 'react';
import Page from '@popup/popupX/shared/Page';
import { useTranslation } from 'react-i18next';
import Text from '@popup/popupX/shared/Text';
import Card from '@popup/popupX/shared/Card';
import { WalletCredential } from '@shared/storage/types';
import AccountInfoListenerContextProvider, { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import { displayNameOrSplitAddress, useIdentityName } from '@popup/shared/utils/account-helpers';
import { Checkbox } from '@popup/popupX/shared/Form/Checkbox';
import { displayAsCcd } from 'wallet-common-helpers';
import { useAtom, useAtomValue } from 'jotai';
import { credentialsAtom, selectedAccountAtom, storedAllowlistAtom } from '@popup/store/account';
import { handleAllowlistEntryUpdate } from '@popup/pages/Allowlist/util';
import { useNavigate, useParams } from 'react-router-dom';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { EventType } from '@concordium/browser-wallet-api-helpers';
import ConcordiumLogo from '@assets/svgX/concordium-logo.svg';
import TrashCan from '@assets/svgX/UiKit/MenuNavigation/menu-trash-can-garbage-delete.svg';
import Button from '@popup/popupX/shared/Button';
import { absoluteRoutes } from '@popup/popupX/constants/routes';

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
        <div className="accounts__item">
            <div className="account-info">
                <Text.Label>{displayNameOrSplitAddress(account)}</Text.Label>
                <Text.Capture>
                    {identityName} | {displayAsCcd(totalBalance, false)} <ConcordiumLogo />
                </Text.Capture>
            </div>
            <Checkbox
                onClick={(e) => {
                    e.stopPropagation();
                }}
                checked={checked}
                onChange={onToggleChecked}
            />
        </div>
    );
}

export interface Props {
    initialSelectedAccounts: string[];
    onChange?: (selectedAccounts: string[]) => void;
}

function AllowlistEntryView({ initialSelectedAccounts, onChange }: Props) {
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
        </AccountInfoListenerContextProvider>
    );
}

function EditAllowlist() {
    const { t } = useTranslation('x', { keyPrefix: 'connectedSites' });
    const nav = useNavigate();
    const { serviceName } = useParams<{ serviceName: string }>();
    const [allowListLoading, setAllowList] = useAtom(storedAllowlistAtom);
    const selectedAccount = useAtomValue(selectedAccountAtom);

    if (!serviceName) {
        throw new Error('Invalid URL - the service name should be part of the URL.');
    }

    if (allowListLoading.loading) {
        return null;
    }

    const decodedServiceName = decodeURIComponent(serviceName);

    async function removeService(serviceNameToRemove: string, allowlist: Record<string, string[]>) {
        const updatedAllowlist = { ...allowlist };
        const disconnectedAccounts = [...updatedAllowlist[serviceNameToRemove]];
        delete updatedAllowlist[serviceNameToRemove];
        await setAllowList(updatedAllowlist);

        for (const account of disconnectedAccounts) {
            popupMessageHandler.broadcastToUrl(EventType.AccountDisconnected, serviceNameToRemove, account);
        }
    }

    return (
        <Page className="allowlist-edit-x">
            <Page.Top heading={t('allowlistEdit')} />
            <Page.Main>
                <Text.Capture>{t('allowlistInfo')}</Text.Capture>
                <Card type="transparent">
                    <AllowlistEntryView
                        initialSelectedAccounts={allowListLoading.value[decodedServiceName]}
                        onChange={(accounts) =>
                            handleAllowlistEntryUpdate(
                                decodedServiceName,
                                allowListLoading.value,
                                accounts,
                                setAllowList,
                                selectedAccount
                            )
                        }
                    />
                </Card>
                <Button.IconText
                    className="remove-connection"
                    icon={<TrashCan />}
                    label={t('remove')}
                    onClick={() =>
                        removeService(decodedServiceName, allowListLoading.value).then(() =>
                            nav(absoluteRoutes.settings.accounts.connectedSites.path)
                        )
                    }
                />
            </Page.Main>
        </Page>
    );
}

export default EditAllowlist;
