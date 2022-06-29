import React from 'react';
import clsx from 'clsx';
import BackIcon from '@assets/svg/back-arrow.svg';
import IconButton, { IconButtonProps } from '../IconButton';

type Props = Omit<IconButtonProps, 'children'> & {
    open: boolean;
};

/**
 * Button, that is a downfacing arrow, unless opened, then it faces up.
 */
export default function MenuButton({ open, className, onClick, ...props }: Props): JSX.Element {
    return (
        <IconButton
            {...props}
            className={clsx('menu-button', open && 'menu-button--open', className)}
            onClick={onClick}
        >
            <BackIcon />
        </IconButton>
    );
}
