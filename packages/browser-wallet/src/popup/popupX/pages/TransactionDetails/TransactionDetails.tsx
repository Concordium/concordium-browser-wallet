import React from 'react';
import Copy from '@assets/svgX/copy.svg';
import ArrowSquareOut from '@assets/svgX/arrow-square-out.svg';
import Card from '@popup/popupX/shared/Card';
import Text from '@popup/popupX/shared/Text';
import Page from '@popup/popupX/shared/Page';
import Button from '@popup/popupX/shared/Button';
import { Navigate, useLocation } from 'react-router-dom';
import { TransactionLogEntry } from '../TransactionLog/TransactionLog';

/** State passed as part of the navigation */
type LocationState = {
    /** Hash of the transaction. */
    transaction: TransactionLogEntry
}

type TransactionDetailsProps = {
    transaction: TransactionLogEntry
}

function TransactionDetails({transaction}: TransactionDetailsProps) {
    return (
        <Page className="transaction-details-x">
            <Page.Top heading="Transaction details">
                <Button.Icon icon={<Copy />} />
                <Button.Icon icon={<ArrowSquareOut />} />
            </Page.Top>
            <Page.Main>
                <Card>
                    <Card.Row>
                        <div className="transaction-details__card_row">
                            <div className="top-info">
                                <Text.Label>{transaction.type}</Text.Label>
                                <Text.Label className={transaction.income ? "income": ""}>{transaction.amount}</Text.Label>
                            </div>
                            <div className="top-info">
                                <Text.Capture>
                                    {transaction.date} <span className="time">{transaction.time}</span>
                                </Text.Capture>
                                <Text.Capture>{transaction.info}</Text.Capture>
                            </div>
                        </div>
                    </Card.Row>
                    {transaction.fromAddress === undefined ? null : <Card.RowDetails title="From address" value={transaction.fromAddress} />}
                    {transaction.toAddress === undefined ? null : <Card.RowDetails title="To address" value={transaction.toAddress} />}
                    <Card.RowDetails
                        title="Transaction hash"
                        value={transaction.hash}
                    />
                    <Card.RowDetails
                        title="Block hash"
                        value={transaction.block}
                    />
                    <Card.Row>
                        <div className="transaction-details__card_row">
                            <Text.Capture>Events</Text.Capture>
                            {transaction.events.map((event)=> (
                                <span className="secondary-info" key={event} >
                                    <Text.Capture>
                                        {event}
                                    </Text.Capture>
                                </span>)
                            )}
                        </div>
                    </Card.Row>
                </Card>
            </Page.Main>
        </Page>
    );
}

export default function Loader () {
    const location = useLocation();
    if (typeof location.state !== 'object' || location.state === null || !("transaction" in location.state)) {
        // No transaction passed as part of the navigation state.
        return <Navigate to="../" />;
    } else {
        const state = location.state as LocationState;
        return <TransactionDetails transaction={state.transaction}/>;
    }
}
