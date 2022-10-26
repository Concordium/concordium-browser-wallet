import React from 'react';
import clsx from 'clsx';
import { displayAsCcd } from 'wallet-common-helpers';
import { useTranslation } from 'react-i18next';

type Props = {
    cost?: bigint;
    className?: string;
};

export default function DisplayCost({ cost, className }: Props) {
    const { t } = useTranslation('shared', { keyPrefix: 'transactionReceipt' });

    return (
        <div className={clsx('display-cost', className)}>
            <p>{t('cost')}</p>
            <p>{cost ? displayAsCcd(cost) : t('unknown')}</p>
        </div>
    );
}
