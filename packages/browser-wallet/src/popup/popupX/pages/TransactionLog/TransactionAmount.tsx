import React from 'react';
import clsx from 'clsx';
import { addThousandSeparators, displayAsCcd, integerToFractional, pipe } from 'wallet-common-helpers';
import { BrowserWalletTransaction, TransactionStatus } from '@popup/shared/utils/transaction-history-types';
import { hasAmount } from '@popup/popupX/pages/TransactionLog/util';
import Text from '@popup/popupX/shared/Text';

export default function TransactionAmount({
    transaction,
    accountAddress,
}: {
    transaction: BrowserWalletTransaction;
    accountAddress: string;
}) {
    const failed = transaction.status === TransactionStatus.Failed;
    const isSender = transaction.fromAddress === accountAddress;
    const isPending = transaction.status === TransactionStatus.Pending;

    if (hasAmount(transaction.type) && !failed) {
        // Flip the amount if selected account is sender, and amount is positive. We expect the transaction list endpoint to sign the amount based on this,
        // but this is not the case for pending transactions. This seeks to emulate the behaviour of the transaction list endpoint.
        const amount = isSender && isPending && transaction.amount > 0n ? -transaction.amount : transaction.amount;

        return (
            <Text.Label className={clsx(amount > 0 && 'income')}>
                {displayAsCcd(transaction.amount, false, true)}
            </Text.Label>
        );
    }

    if (transaction.tokenTransfer) {
        const { value, decimals, tokenId } = transaction.tokenTransfer;
        const transferAmount = isSender ? `-${value}` : value;
        const renderAmount = pipe(integerToFractional(decimals), addThousandSeparators)(transferAmount);

        return (
            <Text.Label className={clsx({ income: !isSender })}>
                {renderAmount} {tokenId}
            </Text.Label>
        );
    }

    return null;
}
