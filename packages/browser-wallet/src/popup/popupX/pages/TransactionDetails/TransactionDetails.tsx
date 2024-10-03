import React from 'react';
import Copy from '@assets/svgX/copy.svg';
import ArrowSquareOut from '@assets/svgX/arrow-square-out.svg';
import Card from '@popup/popupX/shared/Card';
import Text from '@popup/popupX/shared/Text';
import Page from '@popup/popupX/shared/Page';
import Button from '@popup/popupX/shared/Button';

export default function TransactionDetails() {
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
                                <Text.Label>Unstaked amount</Text.Label>
                                <Text.Label className="income">10.02 CCD</Text.Label>
                            </div>
                            <div className="top-info">
                                <Text.Capture>
                                    21 May 2024 <span className="time">11:47</span>
                                </Text.Capture>
                                <Text.Capture>with fee 0.02 CCD</Text.Capture>
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
                    <Card.Row>
                        <div className="transaction-details__card_row">
                            <Text.Capture>Events</Text.Capture>
                            <span className="secondary-info">
                                <Text.Capture className="title-secondary">
                                    Consumed encrypted amounts on account
                                </Text.Capture>
                                <Text.Capture>3HFqdoLs3eGYfbcx6JzxqszG5PsRzDjRoCjJdPUqzkRv16Sca5</Text.Capture>
                            </span>
                            <span className="secondary-info">
                                <Text.Capture className="title-secondary">
                                    Unshielded 1.000000 CCD on account
                                </Text.Capture>
                                <Text.Capture>3HFqdoLs3eGYfbcx6JzxqszG5PsRzDjRoCjJdPUqzkRv16Sca5</Text.Capture>
                            </span>
                        </div>
                    </Card.Row>
                </Card>
            </Page.Main>
        </Page>
    );
}
