import React from 'react';

import { ClassName } from '@shared/utils/types';
import clsx from 'clsx';

type Props = ClassName & {
    children: string | undefined;
};

export default function ErrorMessage({ children, className }: Props): JSX.Element | null {
    if (!children) {
        return null;
    }

    return <div className={clsx('form-error-message', className)}>{children}</div>;
}
