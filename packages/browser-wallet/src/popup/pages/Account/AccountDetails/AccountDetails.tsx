import clsx from 'clsx';
import React, { useEffect, useState } from 'react';
import { displayAsCcd, getPublicAccountAmounts, PublicAccountAmounts } from 'wallet-common-helpers';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { jsonRpcUrlAtom } from '@popup/store/settings';

import { displaySplitAddress } from '@popup/shared/utils/account-helpers';
import VerifiedIcon from '@assets/svg/verified-stamp.svg';
import { AccountInfo } from '@concordium/web-sdk';
import { AccountInfoEmitter } from '../../../shared/account-info-emitter';

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
    const jsonRpcUrl = useAtomValue(jsonRpcUrlAtom);
    const [balances, setBalances] = useState<Omit<PublicAccountAmounts, 'scheduled'>>({
        total: 0n,
        staked: 0n,
        atDisposal: 0n,
    });

    useEffect(() => {
        const emitter = new AccountInfoEmitter(jsonRpcUrl);
        emitter.listen([account]);
        emitter.on('totalchanged', (accountInfo: AccountInfo) => {
            setBalances(getPublicAccountAmounts(accountInfo));
        });
        return () => {
            emitter.removeAllListeners('totalchanged');
            emitter.stop();
        };
    }, [account]);

    return (
        <div className={clsx('account-page-details', expanded && 'account-page-details--expanded')}>
            <div className="account-page-details__address">{displaySplitAddress(account)}</div>
            <div className="account-page-details__id">Identity 1</div>
            <div className="account-page-details__balance">
                <Amount label={t('total')} amount={balances.total} />
                <Amount label={t('atDisposal')} amount={balances.atDisposal} />
                <Amount label={t('stakeAmount')} amount={balances.staked} />
            </div>
            <VerifiedIcon className="account-page-details__stamp" />
        </div>
    );
}
