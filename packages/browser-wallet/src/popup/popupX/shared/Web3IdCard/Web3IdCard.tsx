import React, { ReactNode } from 'react';
import ConcordiumLogo from '@assets/svgX/concordium-logo.svg';
import Card from '@popup/popupX/shared/Card';
import Text from '@popup/popupX/shared/Text';

export default function Web3IdCard() {
    return (
        <Card className="web-id-card-x">
            <Card.Row>
                <ConcordiumLogo />
                <Text.MainMedium>Title</Text.MainMedium>
                <Text.CaptureAdditional>Active</Text.CaptureAdditional>
            </Card.Row>
            <Card.RowDetails title="Degree type" value="AB" />
            <Card.RowDetails title="Degree name" value="degreName1" />
            <Card.RowDetails title="Graduation date" value="Aug 30, 2023, 09:22:46" />
        </Card>
    );
}
