import React from 'react';
import clsx from 'clsx';
import BackIcon from '@assets/svg/back-arrow.svg';
import Button, { ButtonProps } from '../Button';

type Props = Omit<ButtonProps, 'children' | 'clear'> & {
    open: boolean;
};

/**
 * Button, that is a downfacing arrow, unless opened, then it faces up.
 */
export default function MenuButton({ open, className, onClick, ...props }: Props): JSX.Element {
    return (
        <Button
            type="button"
            clear
            {...props}
            className={clsx('menu-button', open && 'menu-button--open', className)}
            onClick={onClick}
        >
            <BackIcon />
        </Button>
    );
}
