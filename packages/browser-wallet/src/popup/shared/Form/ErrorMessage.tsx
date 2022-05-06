import React from 'react';
import { FieldError } from 'react-hook-form';

type Props = {
    children: FieldError | undefined;
};

export default function ErrorMessage({ children }: Props): JSX.Element | null {
    if (!children?.message) {
        return null;
    }

    return <span className="form-error-message">{children.message}</span>;
}
