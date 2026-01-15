import React from 'react';
import { WalletCredential } from '@shared/storage/types';
import { getAccountTypeLabel, isLedgerAccount } from '@shared/utils/account-type-helpers';
import clsx from 'clsx';

type Props = {
    credential: WalletCredential;
    showLabel?: boolean;
    className?: string;
};

export default function AccountTypeIndicator({ credential, showLabel = true, className }: Props) {
    const isLedger = isLedgerAccount(credential);
    const label = getAccountTypeLabel(credential);
    const iconClass = isLedger ? 'ledger-icon' : 'wallet-icon';

    return (
        <div className={clsx('account-type-indicator', className)}>
            <span className={clsx('account-type-icon', iconClass)}>{isLedger ? '🔐' : '💼'}</span>
            {showLabel && <span className="account-type-label">{label}</span>}
        </div>
    );
}
