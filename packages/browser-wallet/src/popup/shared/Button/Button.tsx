import { PolymorphicComponentProps } from '@shared/utils/types';
import clsx from 'clsx';
import React, { ButtonHTMLAttributes, ElementType } from 'react';

type Props = Pick<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'type' | 'children' | 'disabled' | 'className' | 'onClick' | 'onMouseUp'
> & {
    /**
     * Clears all styling from button.
     */
    clear?: boolean;
    /**
     * Fades the button slightly, making it slightly more inaccessible than a regular button.
     */
    faded?: boolean;
    /**
     * Renders button in red.
     */
    danger?: boolean;
    /**
     * Defaults to "dynamic", i.e. "width: auto;"
     */
    width?: 'wide' | 'narrow' | 'dynamic';
};

type PolymorphicProps<A extends ElementType = 'button'> = PolymorphicComponentProps<A, Props>;

/**
 * @description
 * Button component. Defaults to a regular \<button type="button"\> underneath, but can also be used polymorphically through the "as" prop.
 */
export default function Button<A extends ElementType = 'button'>({
    as,
    className,
    clear = false,
    faded = false,
    danger = false,
    width = 'dynamic',
    type = 'button',
    ...props
}: PolymorphicProps<A>) {
    const Component = as || 'button';

    return (
        <Component
            {...props}
            type={type}
            className={clsx(
                'button',
                clear && 'button--clear',
                faded && 'button--faded',
                danger && 'button--danger',
                width === 'narrow' && 'button--narrow',
                width === 'wide' && 'button--wide',
                className
            )}
        />
    );
}
