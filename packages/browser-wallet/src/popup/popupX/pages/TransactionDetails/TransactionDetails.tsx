import React from 'react';
import Copy from '@assets/svgX/copy.svg';
import ArrowSquareOut from '@assets/svgX/arrow-square-out.svg';
import IconButton from '@popup/popupX/shared/IconButton';
import Card from '@popup/popupX/shared/Card';

export default function TransactionDetails() {
    return (
        <div className="transaction-details-container">
            <div className="transaction-details__title">
                <span className="heading_medium">Transaction details</span>
                <IconButton>
                    <Copy />
                </IconButton>
                <IconButton>
                    <ArrowSquareOut />
                </IconButton>
            </div>
            <Card>
                <Card.Row>
                    <div className="transaction-details__card_row">
                        <div className="top-info">
                            <span className="label__main">Unstaked amount</span>
                            <span className="label__main income">10.02 CCD</span>
                        </div>
                        <div className="top-info">
                            <span className="capture__main_small">
                                21 May 2024 <span className="time">11:47</span>
                            </span>
                            <span className="capture__main_small">with fee 0.02 CCD</span>
                        </div>
                    </div>
                </Card.Row>
                <Card.RowDetails title="From address" value="3HFqdoLs3eGYfbcx6JzxqszG5PsRzDjRoCjJdPUqzkRv16Sca5" />
                <Card.RowDetails
                    title="Transaction hash"
                    value="6565a3c0133df3e3644069d5b131bdc605a4c6c9c497ffe3421e1878fb56ec48"
                />
                <Card.RowDetails
                    title="Block hash"
                    value="6d990dcf63b40175c746180a6c86be6c50fd1e41705a82d4908156c1a7f8ab97"
                />
            </Card>
            <div className="transaction-details__card">
                <div className="transaction-details__card_row">
                    <div className="top-info">
                        <span className="label__main">Unstaked amount</span>
                        <span className="label__main income">10.02 CCD</span>
                    </div>
                    <div className="top-info">
                        <span className="capture__main_small">
                            21 May 2024 <span className="time">11:47</span>
                        </span>
                        <span className="capture__main_small">with fee 0.02 CCD</span>
                    </div>
                </div>
                <div className="transaction-details__card_row capture__main_small">
                    <span className="title">From address</span>
                    <span>3HFqdoLs3eGYfbcx6JzxqszG5PsRzDjRoCjJdPUqzkRv16Sca5</span>
                </div>
                <div className="transaction-details__card_row capture__main_small">
                    <span className="title">Transaction hash</span>
                    <span className="">6565a3c0133df3e3644069d5b131bdc605a4c6c9c497ffe3421e1878fb56ec48</span>
                </div>
                <div className="transaction-details__card_row capture__main_small">
                    <span className="title">Block hash</span>
                    <span>6d990dcf63b40175c746180a6c86be6c50fd1e41705a82d4908156c1a7f8ab97</span>
                </div>

                <div className="transaction-details__card_row capture__main_small">
                    <span className="title">Events</span>
                    <span className="secondary-info">
                        <span className="title-secondary">Consumed encrypted amounts on account</span>
                        <span>3HFqdoLs3eGYfbcx6JzxqszG5PsRzDjRoCjJdPUqzkRv16Sca5</span>
                    </span>
                    <span className="secondary-info">
                        <span className="title-secondary">Unshielded 1.000000 CCD on account</span>
                        <span>3HFqdoLs3eGYfbcx6JzxqszG5PsRzDjRoCjJdPUqzkRv16Sca5</span>
                    </span>
                </div>
            </div>
        </div>
    );
}
