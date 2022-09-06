import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import React, { ReactElement } from 'react';
import DisplayAddress, { AddressDisplayFormat } from 'wallet-common-helpers/src/components/DisplayAddress';
import { chunkString } from 'wallet-common-helpers';
import DisplayCost from './DisplayCost';

type Props = {
    className?: string;
    title: string;
    sender: string;
    cost?: bigint;
    hash?: string;
    children: ReactElement;
};
export default function TransactionReceipt({ title, sender, cost = 0n, hash, className, children }: Props) {
    const { t } = useTranslation('shared', { keyPrefix: 'transactionReceipt' });

    return (
        <div className={clsx('transaction-receipt', className)}>
            <p className="transaction-receipt__title">{title}</p>
            <h5>{t('sender')}</h5>
            <DisplayAddress
                className="transaction-receipt__address"
                address={sender}
                format={AddressDisplayFormat.DoubleLine}
            />
            {children}
            <DisplayCost cost={cost} />
            {hash && (
                <div className="transaction-receipt__hash">
                    {chunkString(hash, 32).map((chunk) => (
                        <p className="m-0">{chunk}</p>
                    ))}
                </div>
            )}
        </div>
    );
}
