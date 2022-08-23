import clsx from 'clsx';
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

import VerfifiedIcon from '@assets/svg/verified-stamp.svg';
import RejectedIcon from '@assets/svg/rejected-stamp.svg';
import CheckIcon from '@assets/svg/checkmark-blue.svg';
import EditIcon from '@assets/svg/edit.svg';
import ConcordiumIcon from '@assets/svg/concordium-small.svg';
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
    onChange(name: string): void;
};

function EditableName({ name, onChange }: EditNameProps) {
    const [isEditing, setIsEditing] = useState(false);
    const methods = useForm<EditNameForm>();

    useEffect(() => {
        methods.setValue('name', name);
    }, [name]);

    const handleSubmit = (f: EditNameForm) => {
        onChange(f.name);
        setIsEditing(false);
    };

    if (!isEditing) {
        return (
            <div className="id-card__name-form">
                {name}
                <Button className="id-card__name-edit" clear onClick={() => setIsEditing(true)}>
                    <EditIcon />
                </Button>
            </div>
        );
    }

    return (
        <Form<EditNameForm> formMethods={methods} onSubmit={handleSubmit} className="id-card__name-form">
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
                    <Submit className="id-card__name-edit" clear>
                        <CheckIcon />
                    </Submit>
                </>
            )}
        </Form>
    );
}

type Props = {
    name: string;
    status: 'pending' | 'confirmed' | 'rejected';
    onNameChange(name: string): void;
    provider: JSX.Element;
    className?: string;
};

export default function IdCard({ name, provider, status, onNameChange, className }: Props) {
    const { t } = useTranslation();

    return (
        <div
            className={clsx(
                'id-card',
                status === 'pending' && 'id-card--pending',
                status === 'confirmed' && 'id-card--confirmed',
                status === 'rejected' && 'id-card--rejected',
                className
            )}
        >
            <header className="id-card__header">
                <ConcordiumIcon />
                {t('id.header')}
            </header>
            <div className="id-card__name">
                <EditableName name={name} onChange={onNameChange} />
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
