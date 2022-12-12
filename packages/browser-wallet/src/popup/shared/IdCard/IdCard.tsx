import clsx from 'clsx';
import React, { useState, useEffect, forwardRef, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { noOp } from 'wallet-common-helpers';

import VerfifiedIcon from '@assets/svg/verified-stamp.svg';
import RejectedIcon from '@assets/svg/rejected-stamp.svg';
import CheckIcon from '@assets/svg/checkmark-blue.svg';
import EditIcon from '@assets/svg/edit.svg';
import IdentityIcon from '@assets/svg/identity.svg';
import SuccessIcon from '@assets/svg/rounded-success.svg';
import WarningIcon from '@assets/svg/rounded-warning.svg';
import PendingIcon from '@assets/svg/rounded-pending.svg';

import Form from '../Form';
import Submit from '../Form/Submit';
import Button from '../Button';
import FormInlineInput from '../Form/InlineInput';

const IDENTITY_NAME_MAX_LENGTH = 20;

type EditNameForm = {
    name: string;
};

type EditNameProps = {
    name: string;
    onChange?(name: string): void;
    isEditing: boolean;
};

const EditableName = forwardRef<HTMLFormElement, EditNameProps>(({ name, onChange = noOp, isEditing }, ref) => {
    const methods = useForm<EditNameForm>();

    useEffect(() => {
        methods.setValue('name', name);
    }, [name]);

    const handleSubmit = (f: EditNameForm) => {
        onChange(f.name);
    };

    if (!isEditing) {
        return <div className="id-card__name-form">{name}</div>;
    }

    return (
        <Form<EditNameForm> formMethods={methods} onSubmit={handleSubmit} className="id-card__name-form" ref={ref}>
            {(f) => (
                <>
                    <FormInlineInput
                        name="name"
                        control={f.control}
                        className="id-card__name-field"
                        autoFocus
                        rules={{
                            required: true,
                            maxLength: IDENTITY_NAME_MAX_LENGTH,
                        }}
                    />
                    <Submit className="id-card__name-edit" clear />
                </>
            )}
        </Form>
    );
});

type IdentityStatus = 'pending' | 'confirmed' | 'rejected';

function IdentityStatusIcon({ status }: { status: IdentityStatus }) {
    let StatusIcon = PendingIcon;
    if (status === 'rejected') {
        StatusIcon = WarningIcon;
    } else if (status === 'confirmed') {
        StatusIcon = SuccessIcon;
    }

    return (
        <div className="id-card__header-status-icon">
            <IdentityIcon />
            <StatusIcon />
        </div>
    );
}

type Props = {
    name: string;
    status: IdentityStatus;
    onNameChange?(name: string): void;
    onClick?(): void;
    provider: JSX.Element;
    className?: string;
};
// TODO: Fix these
/* eslint-disable jsx-a11y/no-static-element-interactions , jsx-a11y/click-events-have-key-events */
export default function IdCard({ name, provider, status, onNameChange, className, onClick }: Props) {
    const { t } = useTranslation();
    const [isEditing, setIsEditing] = useState(false);
    const editNameRef = useRef<HTMLFormElement>(null);

    const handleNameChange = (newName: string) => {
        onNameChange?.(newName);
        setIsEditing(false);
    };

    return (
        <div
            className={clsx(
                'id-card',
                status === 'pending' && 'id-card--pending',
                status === 'confirmed' && 'id-card--confirmed',
                status === 'rejected' && 'id-card--rejected',
                className
            )}
            onClick={() => {
                if (onClick) {
                    onClick();
                }
            }}
        >
            <header className="id-card__header">
                <IdentityStatusIcon status={status} />
                {t('id.header')}
                {onNameChange && !isEditing && (
                    <Button clear className="id-card__edit-button" onClick={() => setIsEditing(true)}>
                        <EditIcon />
                    </Button>
                )}
                {onNameChange && isEditing && (
                    <Button clear className="id-card__edit-button" onClick={() => editNameRef.current?.requestSubmit()}>
                        <CheckIcon />
                    </Button>
                )}
            </header>
            <div className="id-card__name">
                <EditableName name={name} onChange={handleNameChange} isEditing={isEditing} ref={editNameRef} />
            </div>
            <div className="id-card__status">
                {status === 'pending' && t('id.pending')}
                {status === 'confirmed' && t('id.confirmed')}
                {status === 'rejected' && t('id.rejected')}&nbsp;{provider}
            </div>
            <div className="id-card__stamp">
                {status === 'confirmed' && <VerfifiedIcon />}
                {status === 'rejected' && <RejectedIcon />}
            </div>
        </div>
    );
}
