import React, { ReactNode } from 'react';
import Card from '@popup/popupX/shared/Card';
import Text from '@popup/popupX/shared/Text';

export default function IdCard() {
    return (
        <Card type="gradient" className="id-card-x">
            <Text.Main>Identity 1</Text.Main>
            <Text.Capture>Verified by NotaBene</Text.Capture>
            <Card>
                <Card.Row>
                    <Text.MainRegular>Identity document type</Text.MainRegular>
                    <Text.MainMedium>Drivers licence</Text.MainMedium>
                </Card.Row>
                <Card.Row>
                    <Text.MainRegular>Identity document number</Text.MainRegular>
                    <Text.MainMedium>BXM680515</Text.MainMedium>
                </Card.Row>
            </Card>
        </Card>
    );
}
