import React, { MouseEventHandler } from 'react';

import EntityList from '@popup/shared/EntityList';
import { EntityListProps } from '@popup/shared/EntityList/EntityList';
import clsx from 'clsx';
import Button from '@popup/shared/Button';

export type Account = { address: string };

type ItemProps = {
    account: Account;
    checked: boolean;
    selected: boolean;
};

function AccountListItem({ account: { address }, checked, selected }: ItemProps) {
    const copy: MouseEventHandler = (e) => {
        e.stopPropagation();
    };

    return (
        <div className={clsx('account-list__item', checked && 'account-list__item--checked')}>
            <div className="account-list__account">
                <div>
                    {address.slice(0, 4)}...{address.slice(address.length - 4)} {selected && 'x'}
                </div>
                <Button
                    clear
                    onMouseUp={copy} // mouseUp event used due to mouseUp being used in EntityListItem, and we need to stop event propagation
                >
                    COPY
                </Button>
            </div>
            <div className="account-list__identity">Identity 1</div>
            <div className="account-list__amount">10,000.00 CCD</div>
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
