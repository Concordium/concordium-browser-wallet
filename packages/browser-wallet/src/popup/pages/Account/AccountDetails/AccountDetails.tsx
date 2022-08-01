import clsx from 'clsx';
import React from 'react';
import { displayAsCcd } from 'wallet-common-helpers';
import { useTranslation } from 'react-i18next';

import { displaySplitAddress } from '@popup/shared/utils/account-helpers';
import VerifiedIcon from '@assets/svg/verified-stamp.svg';

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
    account: string;
};

export default function AccountDetails({ expanded, account }: Props) {
    const { t } = useTranslation('account', { keyPrefix: 'details' });
    return (
        <div className={clsx('account-page-details', expanded && 'account-page-details--expanded')}>
            <div className="account-page-details__address">{displaySplitAddress(account)}</div>
            <div className="account-page-details__id">Identity 1</div>
            <div className="account-page-details__balance">
                <Amount label={t('total')} amount={0n} />
                <Amount label={t('atDisposal')} amount={0n} />
                <Amount label={t('stakeAmount')} amount={0n} />
            </div>
            <VerifiedIcon className="account-page-details__stamp" />
        </div>
    );
}
