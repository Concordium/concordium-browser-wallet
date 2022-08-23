import React, { forwardRef, useEffect, useState } from 'react';
import clsx from 'clsx';
import { useAtomValue, useAtom } from 'jotai';
import { useNavigate } from 'react-router-dom';
import { ClassName, displayAsCcd } from 'wallet-common-helpers';

import CopyButton from '@popup/shared/CopyButton';
import CheckmarkIcon from '@assets/svg/checkmark-blue.svg';
import { absoluteRoutes } from '@popup/constants/routes';
import { accountsAtom, selectedAccountAtom } from '@popup/store/account';
import { useTranslation } from 'react-i18next';
import { displaySplitAddress } from '@popup/shared/utils/account-helpers';
import { AccountInfo } from '@concordium/web-sdk';
import { jsonRpcUrlAtom } from '@popup/store/settings';
import { AccountInfoEmitter } from '@popup/shared/account-info-emitter';
import EntityList from '../EntityList';

export type Account = { address: string };

type ItemProps = {
    account: Account;
    totalBalance: bigint;
    checked: boolean;
    selected: boolean;
};

function AccountListItem({ account: { address }, checked, selected, totalBalance }: ItemProps) {
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
            <div className="main-layout__header-list-item__secondary">Identity 1{/* TODO get from account */}</div>
            <div className="main-layout__header-list-item__secondary mono">{displayAsCcd(totalBalance)}</div>
        </div>
    );
}

type Props = ClassName & {
    onSelect(): void;
};

const AccountList = forwardRef<HTMLDivElement, Props>(({ className, onSelect }, ref) => {
    const accounts = useAtomValue(accountsAtom).map((a) => ({ address: a }));
    const [selectedAccount, setSelectedAccount] = useAtom(selectedAccountAtom);
    const nav = useNavigate();
    const { t } = useTranslation('mainLayout');
    const jsonRpcUrl = useAtomValue(jsonRpcUrlAtom);

    const [totalBalanceMap, setTotalBalanceMap] = useState<Map<string, bigint>>(new Map());

    useEffect(() => {
        const emitter = new AccountInfoEmitter(jsonRpcUrl);
        emitter.listen(accounts.map((account) => account.address));
        emitter.on('totalchanged', (accountInfo: AccountInfo, address: string) => {
            setTotalBalanceMap(new Map(totalBalanceMap.set(address, accountInfo.accountAmount)));
        });
        return () => {
            emitter.removeAllListeners('totalchanged');
            emitter.stop();
        };
    }, [JSON.stringify(accounts)]);

    return (
        <EntityList<Account>
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
        >
            {(a, checked) => (
                <AccountListItem
                    account={a}
                    checked={checked}
                    selected={a.address === selectedAccount}
                    totalBalance={totalBalanceMap.get(a.address) ?? 0n}
                />
            )}
        </EntityList>
    );
});

export default AccountList;
