import React, { ReactNode } from 'react';
import Card from '@popup/popupX/shared/Card';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';

interface IdCardProps {
    rowsIdInfo?: [string, string | ReactNode][];
    rowsConnectedAccounts?: [string, string][];
    onEditName?: () => void;
}

export default function IdCard({ rowsIdInfo = [], rowsConnectedAccounts, onEditName }: IdCardProps) {
    return (
        <Card type="gradient" className="id-card-x">
            <span className="title-row">
                <Text.Main>Identity 1</Text.Main>
                {onEditName && <Button.Secondary label="Edit Name" />}
            </span>
            <Text.Capture>Verified by NotaBene</Text.Capture>
            <Card>
                {rowsIdInfo.map(([key, value]) => (
                    <Card.Row key={key}>
                        <Text.MainRegular>{key}</Text.MainRegular>
                        <Text.MainMedium>{value}</Text.MainMedium>
                    </Card.Row>
                ))}
            </Card>
            {rowsConnectedAccounts && (
                <Card>
                    {rowsConnectedAccounts.map(([key, value]) => (
                        <Card.Row key={key}>
                            <Text.MainRegular>{key}</Text.MainRegular>
                            <Text.MainMedium>{value}</Text.MainMedium>
                        </Card.Row>
                    ))}
                </Card>
            )}
        </Card>
    );
}
