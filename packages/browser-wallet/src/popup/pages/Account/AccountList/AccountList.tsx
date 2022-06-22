import React from 'react';

import EntityList from '@popup/shared/EntityList';
import { EntityListProps } from '@popup/shared/EntityList/EntityList';
import clsx from 'clsx';

export type Account = { address: string };

type Props = Pick<EntityListProps<Account>, 'onSelect' | 'onNew' | 'className'> & {
    accounts: Account[];
    selected?: Account;
};

export default function AccountList({ accounts, selected, ...props }: Props) {
    return (
        <EntityList<Account> {...props} entities={accounts} getKey={(a) => a.address} newText="Add new">
            {(a, checked) => (
                <div className={clsx('account-list__item', checked && 'account-list__item--checked')}>
                    <div className="account-list__account">
                        {a.address.slice(0, 4)}...{a.address.slice(4)} {a.address === selected?.address && 'x'}
                    </div>
                    <div className="account-list__identity">Identity 1</div>
                    <div className="account-list__amount">10,000.00 CCD</div>
                </div>
            )}
        </EntityList>
    );
}
