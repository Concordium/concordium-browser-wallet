import React from 'react';
import clsx from 'clsx';
import { displayAsCcd } from 'wallet-common-helpers';
import { useTranslation } from 'react-i18next';

type Props = {
    cost: bigint;
    className?: string;
};

export default function DisplayAddress({ cost, className }: Props) {
    const { t } = useTranslation('shared', { keyPrefix: 'transactionReceipt' });

    return (
        <div className={clsx('transaction-receipt__cost', className)}>
            <p>{t('cost')}</p>
            <p>{displayAsCcd(cost)}</p>
        </div>
    );
}
