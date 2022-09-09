import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { displayAsCcd, getPublicAccountAmounts, PublicAccountAmounts } from 'wallet-common-helpers';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { identityNamesAtom } from '@popup/store/identity';

import { displaySplitAddress } from '@popup/shared/utils/account-helpers';
import VerifiedIcon from '@assets/svg/verified-stamp.svg';
import { CreationStatus, WalletCredential } from '@shared/storage/types';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';

type AmountProps = {
    label: string;
    amount: bigint;
};

function Amount({ label, amount }: AmountProps) {
    return (
        <div className="account-page-details__amount">
            <div className="account-page-details__amount-label">{label}</div>
            <div className="account-page-details__amount-ccd">{displayAsCcd(amount)}</div>
        </div>
    );
}

type Props = {
    expanded: boolean;
    account: WalletCredential;
    className?: string;
};

const zeroBalance: Omit<PublicAccountAmounts, 'scheduled'> = {
    total: 0n,
    staked: 0n,
    atDisposal: 0n,
};

export default function AccountDetails({ expanded, account, className }: Props) {
    const { t } = useTranslation('account', { keyPrefix: 'details' });
    const [balances, setBalances] = useState<Omit<PublicAccountAmounts, 'scheduled'>>(zeroBalance);
    const identityNames = useAtomValue(identityNamesAtom);
    const accountInfo = useAccountInfo(account);

    useEffect(() => {
        if (!accountInfo) {
            setBalances(zeroBalance);
        } else {
            setBalances(getPublicAccountAmounts(accountInfo));
        }
    }, [accountInfo]);

    return (
        <div className={clsx('account-page-details', expanded && 'account-page-details--expanded', className)}>
            <div className="account-page-details__address">{displaySplitAddress(account.address)}</div>
            <div className="account-page-details__id">
                {identityNames?.[account.providerIndex]?.[account.identityIndex]}
            </div>
            <div className="account-page-details__balance">
                <Amount label={t('total')} amount={balances.total} />
                <Amount label={t('atDisposal')} amount={balances.atDisposal} />
                <Amount label={t('stakeAmount')} amount={balances.staked} />
            </div>
            {account.status === CreationStatus.Confirmed && <VerifiedIcon className="account-page-details__stamp" />}
        </div>
    );
}
