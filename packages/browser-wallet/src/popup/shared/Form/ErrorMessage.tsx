import React from 'react';
import { FieldError } from 'react-hook-form';

import { ClassName } from '@shared/utils/types';
import clsx from 'clsx';

type Props = ClassName & {
    children: FieldError | undefined;
};

export default function ErrorMessage({ children, className }: Props): JSX.Element | null {
    if (!children?.message) {
        return null;
    }

    return <div className={clsx('form-error-message', className)}>{children.message}</div>;
}
