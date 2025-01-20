import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation } from 'react-router-dom';

import Copy from '@assets/svgX/copy.svg';
import ArrowSquareOut from '@assets/svgX/arrow-square-out.svg';
import Card from '@popup/popupX/shared/Card';
import Text from '@popup/popupX/shared/Text';
import Page from '@popup/popupX/shared/Page';
import Button from '@popup/popupX/shared/Button';
import * as CcdScan from '@popup/shared/utils/ccdscan';
import { useCopyToClipboard } from '@popup/popupX/shared/utils/hooks';

import { TransactionLogEntry } from '../TransactionLog/TransactionLog';

/** State passed as part of the navigation */
type LocationState = {
    /** Transaction information. */
    transaction: TransactionLogEntry;
};

type TransactionDetailsProps = {
    transaction: TransactionLogEntry;
};

function TransactionDetails({ transaction }: TransactionDetailsProps) {
    const { t } = useTranslation('x', { keyPrefix: 'transactionDetails' });
    const copy = useCopyToClipboard();
    const copyTransactionHash = useCallback(() => copy(transaction.hash), []);
    const seeOnCcdScan = useCallback(() => {
        CcdScan.openTransaction(transaction.hash);
    }, []);
    return (
        <Page className="transaction-details-x">
            <Page.Top heading={t('title')}>
                <Button.Icon icon={<Copy />} onClick={copyTransactionHash} />
                <Button.Icon icon={<ArrowSquareOut />} onClick={seeOnCcdScan} />
            </Page.Top>
            <Page.Main>
                <Card>
                    <Card.Row>
                        <div className="transaction-details__card_row">
                            <div className="top-info">
                                <Text.Label>{transaction.type}</Text.Label>
                                <Text.Label className={transaction.income ? 'income' : ''}>
                                    {transaction.amount}
                                </Text.Label>
                            </div>
                            <div className="top-info">
                                <Text.Capture>
                                    {transaction.date} <span className="time">{transaction.time}</span>
                                </Text.Capture>
                                <Text.Capture>{transaction.info}</Text.Capture>
                            </div>
                        </div>
                    </Card.Row>
                    {transaction.fromAddress === undefined ? null : (
                        <Card.RowDetails title={t('from')} value={transaction.fromAddress} />
                    )}
                    {transaction.toAddress === undefined ? null : (
                        <Card.RowDetails title={t('to')} value={transaction.toAddress} />
                    )}
                    <Card.RowDetails title={t('tHash')} value={transaction.hash} />
                    <Card.RowDetails title={t('bHash')} value={transaction.block} />
                    <Card.Row>
                        <div className="transaction-details__card_row">
                            <Text.Capture>{t('events')}</Text.Capture>
                            {transaction.events.map((event) => (
                                <span className="secondary-info" key={event}>
                                    <Text.Capture>{event}</Text.Capture>
                                </span>
                            ))}
                        </div>
                    </Card.Row>
                </Card>
            </Page.Main>
        </Page>
    );
}

export default function Loader() {
    const location = useLocation();
    if (typeof location.state !== 'object' || location.state === null || !('transaction' in location.state)) {
        // No transaction passed as part of the navigation state.
        return <Navigate to="../" />;
    }
    const state = location.state as LocationState;
    return <TransactionDetails transaction={state.transaction} />;
}
