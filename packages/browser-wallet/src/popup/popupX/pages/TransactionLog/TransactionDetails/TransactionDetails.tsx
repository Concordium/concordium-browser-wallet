import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Navigate, useLocation, useParams } from 'react-router-dom';
import clsx from 'clsx';
import { TimeStampUnit, dateFromTimestamp, displayAsCcd, noOp, useAsyncMemo } from 'wallet-common-helpers';
import { useAtomValue } from 'jotai';
import { TransactionHash, TransactionStatusEnum } from '@concordium/web-sdk';

import Copy from '@assets/svgX/copy.svg';
import ArrowSquareOut from '@assets/svgX/arrow-square-out.svg';
import Card from '@popup/popupX/shared/Card';
import Text from '@popup/popupX/shared/Text';
import Page from '@popup/popupX/shared/Page';
import Button from '@popup/popupX/shared/Button';
import * as CcdScan from '@popup/shared/utils/ccdscan';
import { useCopyToClipboard } from '@popup/popupX/shared/utils/hooks';
import {
    BrowserWalletTransaction,
    TransactionStatus,
    toBrowserWalletTransaction,
} from '@popup/shared/utils/transaction-history-types';
import { grpcClientAtom } from '@popup/store/settings';

import TransactionAmount from '@popup/popupX/pages/TransactionLog/TransactionAmount';
import { onlyTime, onlyDate, TransactionLogParams, mapTypeToText, memoToString } from '../util';

/** State passed as part of the navigation */
export type TransactionDetailsLocationState = {
    /** Transaction information. */
    transaction: BrowserWalletTransaction;
};

type TransactionDetailsProps = {
    transaction: BrowserWalletTransaction;
    account: string;
};

type Params = TransactionLogParams & {
    transactionHash: string;
};

function TransactionDetails({ transaction, account }: TransactionDetailsProps) {
    const { t } = useTranslation('x', { keyPrefix: 'transactionLogX' });
    const copy = useCopyToClipboard();
    const copyTransactionHash = useCallback(() => {
        if (transaction.transactionHash !== undefined) {
            copy(transaction.transactionHash);
        }
    }, [transaction.transactionHash]);
    const seeOnCcdScan = useCallback(() => {
        if (transaction.transactionHash !== undefined) {
            CcdScan.openTransaction(transaction.transactionHash);
        }
    }, [transaction.transactionHash]);

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
                                <TransactionAmount transaction={transaction} accountAddress={account} />
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
                    {transaction.memo && (
                        <Card.RowDetails title={t('details.memo')} value={memoToString(transaction.memo, null, 2)} />
                    )}
                    <Card.RowDetails title={t('details.bHash')} value={transaction.blockHash} />
                    {transaction.events !== undefined && transaction.events.length !== 0 && (
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

export default function Container() {
    const { account, transactionHash } = useParams<Params>();
    const location = useLocation();
    const grpc = useAtomValue(grpcClientAtom);

    const transaction = useAsyncMemo(
        async () => {
            if (typeof location.state === 'object' && location.state !== null && 'transaction' in location.state) {
                return (location.state as TransactionDetailsLocationState).transaction;
            }

            if (transactionHash === undefined || account === undefined) {
                return null;
            }

            const blockItem = await grpc.getBlockItemStatus(TransactionHash.fromHexString(transactionHash));
            if (blockItem.status !== TransactionStatusEnum.Finalized) {
                return null;
            }
            return toBrowserWalletTransaction(blockItem, account, transactionHash, grpc);
        },
        noOp,
        [grpc, transactionHash]
    );

    if (transaction === null || !account) {
        // Necessary state not available
        return <Navigate to="../" />;
    }

    if (transaction === undefined) {
        // We're still waiting for response
        return null;
    }

    return <TransactionDetails account={account} transaction={transaction} />;
}
