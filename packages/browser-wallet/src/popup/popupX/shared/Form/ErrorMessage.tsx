import React from 'react';
import clsx from 'clsx';
import { ClassName } from 'wallet-common-helpers';
import Exclamation from '@assets/svgX/circled-warning-exclamation.svg';

type Props = ClassName & {
    children: string | undefined;
    exclamationIcon?: boolean;
};

export default function ErrorMessage({ children, className, exclamationIcon }: Props): JSX.Element | null {
    if (!children) {
        return null;
    }

    return (
        <div className={clsx('form-error-message', className)}>
            {exclamationIcon && <Exclamation />}
            {children}
        </div>
    );
}
