import React, { forwardRef, useEffect, useState } from 'react';
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
import JSONBig from 'json-bigint';
import { useAccountInfo } from '@popup/shared/AccountInfoEmitterContext';
import EntityList from '../EntityList';

export type Account = { address: string };

type ItemProps = {
    account: Account;
    totalBalance: bigint;
    checked: boolean;
    selected: boolean;
    identityName: string;
};

function AccountListItem({ account: { address }, checked, selected, totalBalance, identityName }: ItemProps) {
    return (
        <div className={clsx('main-layout__header-list-item', checked && 'main-layout__header-list-item--checked')}>
            <div className="main-layout__header-list-item__primary">
                <div className="flex align-center">
                    {/* TODO add account name */}
                    {displaySplitAddress(address)}{' '}
                    {selected && <CheckmarkIcon className="main-layout__header-list-item__check" />}
                </div>
                <CopyButton
                    className="absolute r-0"
                    value={address}
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
    const [totalBalanceMap, setTotalBalanceMap] = useState<Map<string, bigint>>(new Map());
    const accountInfos = accounts.map(useAccountInfo);

    useEffect(() => {
        for (const info of accountInfos) {
            if (info) {
                setTotalBalanceMap(new Map(totalBalanceMap.set(info.accountAddress, info.accountAmount)));
            }
        }
    }, [JSONBig.stringify(accountInfos)]);

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
                    totalBalance={totalBalanceMap.get(a.address) ?? 0n}
                    identityName={identityNames[a.identityIndex] || 'Unknown'}
                />
            )}
        </EntityList>
    );
});

export default AccountList;
