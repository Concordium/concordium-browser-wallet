import React, { forwardRef, useMemo } from 'react';
import clsx from 'clsx';
import { useAtomValue, useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { ClassName, displayAsCcd } from 'wallet-common-helpers';
import CopyButton from '@popup/shared/CopyButton';
import CheckmarkIcon from '@assets/svg/checkmark-blue.svg';
import { absoluteRoutes } from '@popup/constants/routes';
import { credentialsAtom, selectedAccountAtom } from '@popup/store/account';
import { identityNamesAtom } from '@popup/store/identity';
import { useTranslation } from 'react-i18next';
import { displaySplitAddress } from '@popup/shared/utils/account-helpers';
import { WalletCredential } from '@shared/storage/types';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import EntityList from '../EntityList';

export type Account = { address: string };

type ItemProps = {
    account: WalletCredential;
    checked: boolean;
    selected: boolean;
    identityName: string;
};

function AccountListItem({ account, checked, selected, identityName }: ItemProps) {
    const accountInfo = useAccountInfo(account);
    const totalBalance = useMemo(() => accountInfo?.accountAmount || 0n, [accountInfo?.accountAmount]);

    return (
        <div className={clsx('main-layout__header-list-item', checked && 'main-layout__header-list-item--checked')}>
            <div className="main-layout__header-list-item__primary">
                <div className="flex align-center">
                    {/* TODO add account name */}
                    {displaySplitAddress(account.address)}{' '}
                    {selected && <CheckmarkIcon className="main-layout__header-list-item__check" />}
                </div>
                <CopyButton
                    className="absolute r-0"
                    value={account.address}
                    onMouseUp={(e) => e.stopPropagation()}
                    tabIndex={-1}
                />
            </div>
            <div className="main-layout__header-list-item__secondary">{identityName}</div>
            <div className="main-layout__header-list-item__secondary mono">{displayAsCcd(totalBalance)}</div>
        </div>
    );
}

type Props = ClassName & {
    onSelect(): void;
};

const AccountList = forwardRef<HTMLDivElement, Props>(({ className, onSelect }, ref) => {
    const accounts = useAtomValue(credentialsAtom);
    const [selectedAccount, setSelectedAccount] = useAtom(selectedAccountAtom);
    const nav = useNavigate();
    const { t } = useTranslation('mainLayout');
    const identityNames = useAtomValue(identityNamesAtom);

    return (
        <EntityList<WalletCredential>
            className={className}
            onSelect={(a) => {
                setSelectedAccount(a.address);
                onSelect();
            }}
            onNew={() => nav(absoluteRoutes.home.account.add.path)}
            entities={accounts}
            getKey={(a) => a.address}
            newText={t('accountList.new')}
            ref={ref}
            searchableKeys={['address']}
        >
            {(a, checked) => (
                <AccountListItem
                    account={a}
                    checked={checked}
                    selected={a.address === selectedAccount}
                    identityName={identityNames?.[a.providerIndex]?.[a.identityIndex] || 'Unknown'}
                />
            )}
        </EntityList>
    );
});

export default AccountList;
