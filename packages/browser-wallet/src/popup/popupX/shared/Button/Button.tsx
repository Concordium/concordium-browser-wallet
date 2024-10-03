import clsx from 'clsx';
import React, { ButtonHTMLAttributes, ElementType, ReactNode } from 'react';
import { PolymorphicComponentProps } from 'wallet-common-helpers';

export type ButtonProps = Pick<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'type' | 'children' | 'disabled' | 'className' | 'onClick' | 'onMouseUp' | 'tabIndex'
>;

type PolymorphicProps<A extends ElementType = 'button'> = PolymorphicComponentProps<A, ButtonProps>;

/**
 * @description
 * Button component. Defaults to a regular \<button type="button"\> underneath, but can also be used polymorphically through the "as" prop.
 */
export function ButtonBase<A extends ElementType = 'button'>({
    as,
    className,
    type = 'button',
    ...props
}: PolymorphicProps<A>) {
    const Component = as || 'button';

    return <Component {...props} type={type} className={className} />;
}

function ButtonMain({ label, className, ...props }: { label: string } & ButtonProps) {
    return (
        <ButtonBase className={`button__main ${className}`} {...props}>
            {label}
        </ButtonBase>
    );
}

function ButtonSecondary({ label, className, ...props }: { label: string } & ButtonProps) {
    return (
        <ButtonBase className={`button__secondary ${className}`} {...props}>
            {label}
        </ButtonBase>
    );
}

function ButtonIcon({ icon, className, ...props }: { icon: ReactNode } & ButtonProps) {
    return (
        <ButtonBase className={`button__icon ${className}`} {...props}>
            {icon}
        </ButtonBase>
    );
}

const Button = {
    Main: ButtonMain,
    Secondary: ButtonSecondary,
    Icon: ButtonIcon,
};

export default Button;
