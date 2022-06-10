import { PolymorphicComponentProps } from '@shared/utils/types';
import clsx from 'clsx';
import React, { ButtonHTMLAttributes, ElementType } from 'react';

type Props = Pick<ButtonHTMLAttributes<HTMLButtonElement>, 'type' | 'children' | 'disabled' | 'className'> & {
    clear?: boolean;
    faded?: boolean;
    width?: 'wide' | 'narrow';
};

type PolymorphicProps<A extends ElementType = 'button'> = PolymorphicComponentProps<A, Props>;

export default function Button<A extends ElementType = 'button'>({
    as,
    className,
    clear = false,
    faded = false,
    width,
    ...props
}: PolymorphicProps<A>) {
    const Component = as || 'button';

    return (
        <Component
            {...props}
            className={clsx(
                'button',
                clear && 'button--clear',
                faded && 'button--faded',
                width === 'narrow' && 'button--narrow',
                width === 'wide' && 'button--wide',
                className
            )}
        />
    );
}
