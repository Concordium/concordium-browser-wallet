import clsx from 'clsx';
import { useTranslation } from 'react-i18next';
import React, { ReactElement } from 'react';
import DisplayAddress, { AddressDisplayFormat } from 'wallet-common-helpers/src/components/DisplayAddress';
import { chunkString } from 'wallet-common-helpers';
import { AccountTransactionType } from '@concordium/web-sdk';
import DisplayCost from './DisplayCost';
import { getTransactionTypeName } from '../utils/transaction-helpers';

type Props = {
    className?: string;
    transactionType: AccountTransactionType;
    sender: string;
    cost?: bigint;
    hash?: string;
    children: ReactElement;
};
export default function TransactionReceipt({ transactionType, sender, cost = 0n, hash, className, children }: Props) {
    const { t } = useTranslation('shared', { keyPrefix: 'transactionReceipt' });

    return (
        <div className={clsx('transaction-receipt', className)}>
            <p className="transaction-receipt__title">
                {t('title', { typeName: getTransactionTypeName(transactionType) })}
            </p>
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
