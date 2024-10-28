import React, { ChangeEvent, useState, KeyboardEvent, useCallback } from 'react';

export default function useEditableValue(current: string, fallback: string, onNewValue: (newValue: string) => void) {
    const [isEditing, setIsEditing] = useState(false);
    const [edited, setEdited] = useState(current);
    // Using edited instead of currentValue to avoid flickering after completing.
    const displayName = edited === '' ? fallback : edited;
    const onAbort = useCallback(() => {
        setIsEditing(false);
        setEdited(current);
    }, []);
    const onComplete = useCallback(() => {
        onNewValue(edited.trim());
        setIsEditing(false);
    }, []);
    const onEdit = useCallback(() => {
        setEdited(current);
        setIsEditing(true);
    }, []);
    const onInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        setEdited(event.target.value);
    };
    const onKeyUp = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            onComplete();
        }
    };
    const value = isEditing ? (
        <input
            className="editable-value-x"
            autoFocus
            maxLength={25}
            value={edited}
            placeholder={fallback}
            onChange={onInputChange}
            onKeyUp={onKeyUp}
        />
    ) : (
        displayName
    );
    return { value, isEditing, onAbort, onComplete, onEdit };
}
