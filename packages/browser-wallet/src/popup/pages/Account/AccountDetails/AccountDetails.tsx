import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { displayAsCcd, getPublicAccountAmounts, PublicAccountAmounts } from 'wallet-common-helpers';
import { useTranslation } from 'react-i18next';
import { displayNameOrSplitAddress, useIdentityName } from '@popup/shared/utils/account-helpers';
import VerifiedIcon from '@assets/svg/verified-stamp.svg';
import { CreationStatus, WalletCredential } from '@shared/storage/types';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import { isDelegatorAccount, isBakerAccount, DelegationTargetType } from '@concordium/web-sdk';

type AmountProps = {
    label: string;
    amount: bigint;
};

function Amount({ label, amount }: AmountProps) {
    return (
        <div className="account-page-details__amount">
            <div className="label label--faded">{label}</div>
            <div className="account-page-details__amount-ccd">{displayAsCcd(amount)}</div>
        </div>
    );
}

type Props = {
    expanded: boolean;
    account: WalletCredential;
    className?: string;
};

const zeroBalance: Omit<PublicAccountAmounts, 'scheduled' | 'cooldown'> = {
    total: 0n,
    staked: 0n,
    atDisposal: 0n,
};

export default function AccountDetails({ expanded, account, className }: Props) {
    const { t } = useTranslation('account', { keyPrefix: 'details' });
    const [balances, setBalances] = useState<Omit<PublicAccountAmounts, 'scheduled' | 'cooldown'>>(zeroBalance);
    const identityName = useIdentityName(account);
    const accountInfo = useAccountInfo(account);

    useEffect(() => {
        if (!accountInfo) {
            setBalances(zeroBalance);
        } else {
            setBalances(getPublicAccountAmounts(accountInfo));
        }
    }, [accountInfo]);

    function stakeLabel() {
        if (!accountInfo) {
            return t('stakeAmount');
        }

        if (isBakerAccount(accountInfo)) {
            return t('stakeWithBaker', { bakerId: accountInfo.accountBaker.bakerId });
        }
        if (isDelegatorAccount(accountInfo)) {
            if (accountInfo.accountDelegation.delegationTarget.delegateType === DelegationTargetType.Baker) {
                return t('delegationWithBaker', { bakerId: accountInfo.accountDelegation.delegationTarget.bakerId });
            }
            return t('passiveDelegation');
        }

        return t('stakeAmount');
    }

    return (
        <div className={clsx('account-page-details', expanded && 'account-page-details--expanded', className)}>
            <div className="account-page-details__address">{displayNameOrSplitAddress(account)}</div>
            <div className="account-page-details__id">{identityName}</div>
            <div className="account-page-details__balance">
                <Amount label={t('total')} amount={balances.total} />
                <Amount label={t('atDisposal')} amount={balances.atDisposal} />
                <Amount label={stakeLabel()} amount={balances.staked} />
            </div>
            {account.status === CreationStatus.Confirmed && <VerifiedIcon className="account-page-details__stamp" />}
        </div>
    );
}
