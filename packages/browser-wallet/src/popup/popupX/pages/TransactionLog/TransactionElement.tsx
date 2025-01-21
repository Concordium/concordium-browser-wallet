import React, { CSSProperties } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { displayAsCcd, dateFromTimestamp, TimeStampUnit } from 'wallet-common-helpers';

import { BrowserWalletTransaction, TransactionStatus } from '@popup/shared/utils/transaction-history-types';
import Button from '@popup/popupX/shared/Button';
import Text from '@popup/popupX/shared/Text';
import Note from '@assets/svgX/note.svg';
import { displaySplitAddressShort } from '@popup/shared/utils/account-helpers';

import { hasAmount, mapTypeToText, onlyTime } from './util';

const SPACING = 4;
export const TRANSACTION_ELEMENT_HEIGHT = 68; // element height + row spacing = rem(64px) + rem(4px)

interface Props {
    transaction: BrowserWalletTransaction;
    style?: CSSProperties;
    accountAddress: string;
    onClick?: () => void;
}

/**
 * A transaction element in a TransactionList.
 */
export default function TransactionElement({ accountAddress, transaction, style, onClick }: Props) {
    const { t } = useTranslation('x', { keyPrefix: 'transactionLogX' });

    const failed = transaction.status === TransactionStatus.Failed;
    const isSender = transaction.fromAddress === accountAddress;

    // Flip the amount if selected account is sender, and amount is positive. We expect the transaction list endpoint to sign the amount based on this,
    // but this is not the case for pending transactions. This seeks to emulate the behaviour of the transaction list endpoint.
    const amount =
        isSender && transaction.status === TransactionStatus.Pending && transaction.amount > 0n
            ? -transaction.amount
            : transaction.amount;
    const time = onlyTime(dateFromTimestamp(transaction.time, TimeStampUnit.seconds));
    const info =
        (transaction.cost !== undefined && t('withFee', { value: displayAsCcd(transaction.cost, false, true) })) ??
        (transaction.fromAddress && t('from', { value: displaySplitAddressShort(transaction.fromAddress) }));

    return (
        <Button.Base
            key={transaction.transactionHash}
            className="transaction-log__transaction"
            style={{ ...style, height: TRANSACTION_ELEMENT_HEIGHT - SPACING }}
            onClick={onClick}
        >
            <div className={clsx('transaction value', failed && 'failed')}>
                <Text.Label className="type">{mapTypeToText(transaction.type)}</Text.Label>
                {hasAmount(transaction.type) && !failed && (
                    <Text.Label className={clsx(amount > 0 && 'income')}>
                        {displayAsCcd(transaction.amount, false, true)}
                    </Text.Label>
                )}
            </div>
            <div className="transaction info">
                <Text.Capture>{time}</Text.Capture>
                {info && <Text.Capture>{info}</Text.Capture>}
            </div>
            {transaction.memo && (
                <div className="transaction note">
                    <Note />
                    <Text.Capture>{transaction.memo}</Text.Capture>
                </div>
            )}
        </Button.Base>
    );
}
