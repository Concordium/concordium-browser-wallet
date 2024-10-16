import clsx from 'clsx';
import React, { ButtonHTMLAttributes, ElementType, ReactNode } from 'react';
import { PolymorphicComponentProps } from 'wallet-common-helpers';
import Text from '@popup/popupX/shared/Text';

export type ButtonProps = Pick<
    ButtonHTMLAttributes<HTMLButtonElement>,
    'type' | 'children' | 'disabled' | 'className' | 'onClick' | 'onMouseUp' | 'tabIndex' | 'form'
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
        <ButtonBase className={clsx('button__main', className)} {...props}>
            {label}
        </ButtonBase>
    );
}

function ButtonSecondary({ label, icon, className, ...props }: { label: string; icon?: ReactNode } & ButtonProps) {
    return (
        <ButtonBase className={clsx('button__secondary', className)} {...props}>
            {icon}
            <Text.CaptureAdditional>{label}</Text.CaptureAdditional>
        </ButtonBase>
    );
}

function ButtonIcon({ icon, className, ...props }: { icon: ReactNode } & ButtonProps) {
    return (
        <ButtonBase className={clsx('button__icon', className)} {...props}>
            {icon}
        </ButtonBase>
    );
}

function ButtonText({ label, className, ...props }: { label: string } & ButtonProps) {
    return (
        <ButtonBase className={clsx('button__icon', 'text', className)} {...props}>
            <Text.Label>{label}</Text.Label>
        </ButtonBase>
    );
}

function ButtonIconText({
    icon,
    label,
    leftLabel,
    className,
    ...props
}: { icon: ReactNode; label?: string; leftLabel?: boolean } & ButtonProps) {
    return (
        <ButtonBase className={clsx('button__icon', 'text', className)} {...props}>
            {leftLabel && <Text.Label>{label}</Text.Label>}
            {icon}
            {!leftLabel && <Text.Label>{label}</Text.Label>}
        </ButtonBase>
    );
}

function ButtonIconTile({ icon, label, className, ...props }: { icon: ReactNode; label: string } & ButtonProps) {
    return (
        <ButtonBase className={clsx('button__icon', 'tile', className)} {...props}>
            {icon}
            <Text.CaptureAdditional>{label}</Text.CaptureAdditional>
        </ButtonBase>
    );
}

const Button = {
    Base: ButtonBase,
    Main: ButtonMain,
    Secondary: ButtonSecondary,
    Icon: ButtonIcon,
    IconText: ButtonIconText,
    Text: ButtonText,
    IconTile: ButtonIconTile,
};

export default Button;
