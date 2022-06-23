import React from 'react';
import clsx from 'clsx';

import EntityList from '@popup/shared/EntityList';
import { EntityListProps } from '@popup/shared/EntityList/EntityList';
import CopyButton from '@popup/shared/CopyButton';
import CheckmarkIcon from '@assets/svg/checkmark-blue.svg';

export type Account = { address: string };

type ItemProps = {
    account: Account;
    checked: boolean;
    selected: boolean;
};

function AccountListItem({ account: { address }, checked, selected }: ItemProps) {
    return (
        <div className={clsx('account-list-item', checked && 'account-list-item--checked')}>
            <div className="account-list-item__account">
                <div className="flex align-center">
                    {address.slice(0, 4)}...{address.slice(address.length - 4)}{' '}
                    {selected && <CheckmarkIcon className="account-list-item__check" />}
                </div>
                <CopyButton
                    className="absolute r-0"
                    value={address}
                    onMouseUp={(e) => e.stopPropagation()}
                    tabIndex={-1}
                />
            </div>
            <div className="account-list-item__identity">Identity 1</div>
            <div className="account-list-item__amount">10,000.00 CCD</div>
        </div>
    );
}

type Props = Pick<EntityListProps<Account>, 'onSelect' | 'onNew' | 'className'> & {
    accounts: Account[];
    selected?: Account;
};

export default function AccountList({ accounts, selected, ...props }: Props) {
    return (
        <EntityList<Account> {...props} entities={accounts} getKey={(a) => a.address} newText="Add new">
            {(a, checked) => (
                <AccountListItem account={a} checked={checked} selected={a.address === selected?.address} />
            )}
        </EntityList>
    );
}
