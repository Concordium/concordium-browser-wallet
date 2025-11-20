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
        <div className="editable-name">
            <Button.Main label={t('idCard.name.save')} size="small" onClick={editable.onComplete} />
            <Button.Main label={t('idCard.name.abort')} size="small" onClick={editable.onAbort} />
        </div>
    ) : (
        onNewName && <Button.Main label={t('idCard.name.edit')} size="small" onClick={editable.onEdit} />
    );
    return {
        value: editable.value,
        actions: editNameAction,
    };
}
