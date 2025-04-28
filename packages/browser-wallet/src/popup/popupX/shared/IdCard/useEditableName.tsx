import React from 'react';
import { BaseIdentity } from '@shared/storage/types';
import { useTranslation } from 'react-i18next';
import useEditableValue from '@popup/popupX/shared/EditableValue';
import Button from '@popup/popupX/shared/Button';

function fallbackIdentityName(index: number) {
    return `Identity ${index + 1}`;
}

export type NewNameHandler = (name: string) => void;

export default function useEditableName(identity: BaseIdentity, onNewName?: NewNameHandler) {
    const { t } = useTranslation('x', { keyPrefix: 'sharedX' });
    const editable = useEditableValue(identity.name, fallbackIdentityName(identity.index), onNewName ?? (() => {}));
    const editNameAction = editable.isEditing ? (
        <>
            <Button.Secondary label={t('idCard.name.save')} onClick={editable.onComplete} />
            <Button.Secondary label={t('idCard.name.abort')} onClick={editable.onAbort} />
        </>
    ) : (
        onNewName && <Button.Secondary label={t('idCard.name.edit')} onClick={editable.onEdit} />
    );
    return {
        value: editable.value,
        actions: editNameAction,
    };
}
