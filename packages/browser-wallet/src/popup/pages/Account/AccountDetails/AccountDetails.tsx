import clsx from 'clsx';
import React from 'react';

type Props = {
    expanded: boolean;
    account: string;
};

export default function AccountDetails({ expanded, account }: Props) {
    return <div className={clsx('account-page-details', expanded && 'account-page-details--expanded')}>{account}</div>;
}
