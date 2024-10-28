import React, { ReactNode } from 'react';
import Card from '@popup/popupX/shared/Card';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import useEditableValue from '@popup/popupX/shared/EditableValue';

export type IdCardAttributeInfo = {
    key: string;
    value: string | ReactNode;
};

export type IdCardAccountInfo = {
    address: string;
    amount: ReactNode;
};

export type IdCardProps = {
    idProviderName: string;
    identityName: string;
    rowsIdInfo?: IdCardAttributeInfo[];
    rowsConnectedAccounts?: IdCardAccountInfo[];
    onNewName?: (newName: string) => void;
    identityNameFallback?: string;
};

export default function IdCard({
    idProviderName,
    identityName,
    rowsIdInfo = [],
    rowsConnectedAccounts,
    onNewName,
    identityNameFallback,
}: IdCardProps) {
    const editable = useEditableValue(identityName, identityNameFallback ?? '', onNewName ?? (() => {}));
    return (
        <Card type="gradient" className="id-card-x">
            <span className="title-row">
                <Text.Main>{editable.value}</Text.Main>
                {editable.isEditing ? (
                    <>
                        <Button.Secondary label="Save" onClick={editable.onComplete} />
                        <Button.Secondary label="Abort" onClick={editable.onAbort} />
                    </>
                ) : (
                    onNewName && <Button.Secondary label="Edit Name" onClick={editable.onEdit} />
                )}
            </span>
            <Text.Capture>Verified by {idProviderName}</Text.Capture>
            <Card>
                {rowsIdInfo.map((info) => (
                    <Card.Row key={info.key}>
                        <Text.MainRegular>{info.key}</Text.MainRegular>
                        <Text.MainMedium>{info.value}</Text.MainMedium>
                    </Card.Row>
                ))}
            </Card>
            {rowsConnectedAccounts && (
                <Card>
                    {rowsConnectedAccounts.map((account) => (
                        <Card.Row key={account.address}>
                            <Text.MainRegular>{account.address}</Text.MainRegular>
                            <Text.MainMedium>{account.amount}</Text.MainMedium>
                        </Card.Row>
                    ))}
                </Card>
            )}
        </Card>
    );
}
