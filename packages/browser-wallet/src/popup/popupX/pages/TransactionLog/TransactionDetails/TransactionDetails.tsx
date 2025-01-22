import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import clsx from 'clsx';
import { TimeStampUnit, dateFromTimestamp, displayAsCcd } from 'wallet-common-helpers';

import Copy from '@assets/svgX/copy.svg';
import ArrowSquareOut from '@assets/svgX/arrow-square-out.svg';
import Card from '@popup/popupX/shared/Card';
import Text from '@popup/popupX/shared/Text';
import Page from '@popup/popupX/shared/Page';
import Button from '@popup/popupX/shared/Button';
import * as CcdScan from '@popup/shared/utils/ccdscan';
import { useCopyToClipboard } from '@popup/popupX/shared/utils/hooks';
import { BrowserWalletTransaction, TransactionStatus } from '@popup/shared/utils/transaction-history-types';
import { useCredential } from '@popup/shared/utils/account-helpers';
import { WalletCredential } from '@shared/storage/types';
import { onlyTime, onlyDate, TransactionLogParams, mapTypeToText, hasAmount } from '../util';

/** State passed as part of the navigation */
export type TransactionDetailsLocationState = {
    /** Transaction information. */
    transaction: BrowserWalletTransaction;
};

type TransactionDetailsProps = {
    transaction: BrowserWalletTransaction;
    account: WalletCredential;
};

function TransactionDetails({ transaction, account }: TransactionDetailsProps) {
    const { t } = useTranslation('x', { keyPrefix: 'transactionLogX' });
    const copy = useCopyToClipboard();
    const copyTransactionHash = useCallback(() => copy(transaction.transactionHash), []);
    const seeOnCcdScan = useCallback(() => {
        CcdScan.openTransaction(transaction.transactionHash);
    }, []);

    // Flip the amount if selected account is sender, and amount is positive. We expect the transaction list endpoint to sign the amount based on this,
    // but this is not the case for pending transactions. This seeks to emulate the behaviour of the transaction list endpoint.
    const isSender = account.address === transaction.fromAddress;
    const amount =
        isSender && transaction.status === TransactionStatus.Pending && transaction.amount > 0n
            ? -transaction.amount
            : transaction.amount;
    const date = dateFromTimestamp(transaction.time, TimeStampUnit.seconds);
    const info = transaction.cost !== undefined && t('withFee', { value: displayAsCcd(transaction.cost, false, true) });
    const failed = transaction.status === TransactionStatus.Failed;

    return (
        <Page className="transaction-details-x">
            <Page.Top heading={t('details.title')}>
                {transaction.transactionHash && (
                    <>
                        <Button.Icon icon={<Copy />} onClick={copyTransactionHash} />
                        <Button.Icon icon={<ArrowSquareOut />} onClick={seeOnCcdScan} />
                    </>
                )}
            </Page.Top>
            <Page.Main>
                <Card>
                    <Card.Row>
                        <div className="transaction-details__card_row">
                            <div className="top-info">
                                <Text.Label className={clsx(failed && 'failed')}>
                                    {mapTypeToText(transaction.type)}
                                </Text.Label>
                                {hasAmount(transaction.type) && !failed && (
                                    <Text.Label className={clsx(amount > 0 && 'income')}>
                                        {displayAsCcd(transaction.amount, false, true)}
                                    </Text.Label>
                                )}
                            </div>
                            <div className="top-info">
                                <Text.Capture>
                                    {onlyDate(date)} <span className="time">{onlyTime(date)}</span>
                                </Text.Capture>
                                <Text.Capture>{info}</Text.Capture>
                            </div>
                        </div>
                    </Card.Row>
                    {transaction.rejectReason && (
                        <Card.RowDetails title={t('details.rejectReason')} value={transaction.rejectReason} />
                    )}
                    {transaction.fromAddress === undefined ? null : (
                        <Card.RowDetails title={t('details.from')} value={transaction.fromAddress} />
                    )}
                    {transaction.toAddress === undefined ? null : (
                        <Card.RowDetails title={t('details.to')} value={transaction.toAddress} />
                    )}
                    {transaction.transactionHash && (
                        <Card.RowDetails title={t('details.tHash')} value={transaction.transactionHash} />
                    )}
                    <Card.RowDetails title={t('details.bHash')} value={transaction.blockHash} />
                    {transaction.events !== undefined && (
                        <Card.Row>
                            <div className="transaction-details__card_row">
                                <Text.Capture>{t('details.events')}</Text.Capture>
                                {transaction.events.map((event) => (
                                    <span className="secondary-info" key={event}>
                                        <Text.Capture>{event}</Text.Capture>
                                    </span>
                                ))}
                            </div>
                        </Card.Row>
                    )}
                </Card>
            </Page.Main>
        </Page>
    );
}

export default function Loader() {
    const params = useParams<TransactionLogParams>();
    const account = useCredential(params.account);
    const location = useLocation();
    if (
        typeof location.state !== 'object' ||
        location.state === null ||
        !('transaction' in location.state) ||
        account === undefined
    ) {
        // Necessary state not available
        return <Navigate to="../" />;
    }
    const state = location.state as TransactionDetailsLocationState;
    return <TransactionDetails account={account} transaction={state.transaction} />;
}
