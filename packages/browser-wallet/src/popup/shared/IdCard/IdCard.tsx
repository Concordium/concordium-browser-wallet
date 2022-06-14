import clsx from 'clsx';
import React, { useState } from 'react';

import VerfifiedIcon from '@assets/svg/verified-stamp.svg';
import RejectedIcon from '@assets/svg/rejected-stamp.svg';
import CheckIcon from '@assets/svg/checkmark-blue.svg';
import EditIcon from '@assets/svg/edit.svg';
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

    const handleSubmit = (f: EditNameForm) => {
        onChange(f.name);
        setIsEditing(false);
    };

    return (
        <Form<EditNameForm> onSubmit={handleSubmit} className="id-card__name">
            {(f) => (
                <>
                    {isEditing ? (
                        <FormInlineInput
                            name="name"
                            control={f.control}
                            className="id-card__name-field"
                            defaultValue={name}
                            fallbackValue={name}
                            autoFocus
                            rules={{
                                required: true,
                                maxLength: IDENTITY_NAME_MAX_LENGTH,
                            }}
                        />
                    ) : (
                        name
                    )}
                    {isEditing ? (
                        <Submit className="id-card__name-edit" clear>
                            <CheckIcon />
                        </Submit>
                    ) : (
                        <Button className="id-card__name-edit" clear onClick={() => setIsEditing(true)}>
                            <EditIcon />
                        </Button>
                    )}
                </>
            )}
        </Form>
    );
}

type Props = {
    name: string;
    status: 'pending' | 'verified' | 'rejected';
    onNameChange(name: string): void;
    provider: JSX.Element;
};

export default function IdCard({ name, provider, status, onNameChange }: Props) {
    return (
        <div
            className={clsx(
                'id-card',
                status === 'pending' && 'id-card--pending',
                status === 'rejected' && 'id-card--rejected'
            )}
        >
            <header className="id-card__header">Concordium identity</header>
            <div className="id-card__name">
                <EditableName name={name} onChange={onNameChange} />
            </div>
            <div className="id-card__status">
                {status} {provider}
            </div>
            <div className="id-card__stamp">
                {status === 'verified' && <VerfifiedIcon />}
                {status === 'rejected' && <RejectedIcon />}
            </div>
        </div>
    );
}
