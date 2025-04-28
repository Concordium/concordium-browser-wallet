import React from 'react';
import clsx from 'clsx';
import { useNavigate } from 'react-router-dom';

import BackIcon from '@assets/svg/back-arrow.svg';
import IconButton, { IconButtonProps } from '../IconButton';

type Props = Pick<IconButtonProps, 'className'>;

export default function BackButton({ className }: Props) {
    const nav = useNavigate();

    return (
        <IconButton className={clsx('back-button', className)} onClick={() => nav(-1)}>
            <BackIcon />
        </IconButton>
    );
}
