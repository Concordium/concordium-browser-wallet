import React from 'react';
import CloseButton from '@popup/shared/CloseButton';
import { BrowserWalletTransaction, TransactionStatus } from '@popup/shared/utils/transaction-history-types';
import SidedRow from '@popup/shared/SidedRow';
import CopyButton from '@popup/shared/CopyButton';
import { useTranslation } from 'react-i18next';
import TransactionElement from './TransactionElement';

function Title({ title }: { title: string }) {
    return <div className="transaction-details__title">{title}</div>;
}

function CopyableItem({ title, value }: { title: string; value: string }) {
    return (
        <div className="transaction-details__item">
            <SidedRow left={<Title title={title} />} right={<CopyButton value={value} />} />
            {value}
        </div>
    );
}

export default function TransactionDetails({
    accountAddress,
    transaction,
    onClose,
}: {
    accountAddress: string;
    transaction: BrowserWalletTransaction;
    onClose: () => void;
}) {
    const { t } = useTranslation('transactionLog');

    return (
        <div className="transaction-details">
            <div className="transaction-details__header">
                {t('header')}
                <CloseButton className="transaction-details__close" onClick={onClose} />
            </div>
            <TransactionElement accountAddress={accountAddress} transaction={transaction} withDate />
            {transaction.status === TransactionStatus.Failed && (
                <div className="transaction-details__dynamic-height-item">
                    <Title title={t('rejectReason')} />
                    {transaction.rejectReason}
                </div>
            )}
            {transaction.fromAddress && <CopyableItem title={t('fromAddress')} value={transaction.fromAddress} />}
            {transaction.toAddress && <CopyableItem title={t('toAddress')} value={transaction.toAddress} />}
            {transaction.transactionHash && (
                <CopyableItem title={t('transactionHash')} value={transaction.transactionHash} />
            )}
            {transaction.blockHash && <CopyableItem title={t('blockHash')} value={transaction.blockHash} />}
            {transaction.events && transaction.events.length > 0 && (
                <div className="transaction-details__dynamic-height-item">
                    <Title title={t('events')} />
                    {transaction.events}
                </div>
            )}
        </div>
    );
}
