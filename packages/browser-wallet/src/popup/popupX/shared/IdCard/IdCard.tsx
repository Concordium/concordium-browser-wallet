import React, { ReactNode } from 'react';
import Card from '@popup/popupX/shared/Card';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import useEditableValue from '@popup/popupX/shared/EditableValue';
import { useTranslation } from 'react-i18next';
import { ClassName } from 'wallet-common-helpers';
import clsx from 'clsx';

export type IdCardAttributeInfo = {
    key: string;
    value: string | ReactNode;
};

export type IdCardAccountInfo = {
    address: string;
    amount: ReactNode;
};

export type IdCardProps = ClassName & {
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
    className,
}: IdCardProps) {
    const editable = useEditableValue(identityName, identityNameFallback ?? '', onNewName ?? (() => {}));
    const { t } = useTranslation('x', { keyPrefix: 'sharedX' });

    return (
        <Card type="gradient" className={clsx('id-card-x', className)}>
            <span className="title-row">
                <Text.Main>{editable.value}</Text.Main>
                {editable.isEditing ? (
                    <>
                        <Button.Secondary label={t('idCard.name.save')} onClick={editable.onComplete} />
                        <Button.Secondary label={t('idCard.name.abort')} onClick={editable.onAbort} />
                    </>
                ) : (
                    onNewName && <Button.Secondary label={t('idCard.name.edit')} onClick={editable.onEdit} />
                )}
            </span>
            <Text.Capture>{t('idCard.verifiedBy', { idProviderName })}</Text.Capture>
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
