import React from 'react';
import clsx from 'clsx';

import CloseIcon from '@assets/svg/cross.svg';
import IconButton, { IconButtonProps } from '../IconButton';

type Props = Pick<IconButtonProps, 'onClick' | 'className'>;

export default function CloseButton({ className, onClick }: Props) {
    return (
        <IconButton className={clsx('close-button', className)} onClick={onClick}>
            <CloseIcon />
        </IconButton>
    );
}
