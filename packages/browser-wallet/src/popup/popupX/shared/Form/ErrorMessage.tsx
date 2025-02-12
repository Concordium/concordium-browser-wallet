import React from 'react';
import clsx from 'clsx';
import { ClassName } from 'wallet-common-helpers';

type Props = ClassName & {
    children: string | undefined;
};

export default function ErrorMessage({ children, className }: Props): JSX.Element | null {
    if (!children) {
        return null;
    }

    return <div className={clsx('form-error-message', className)}>{children}</div>;
}
