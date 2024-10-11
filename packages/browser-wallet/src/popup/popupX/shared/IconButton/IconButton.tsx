import React, { ComponentProps } from 'react';
import clsx from 'clsx';
import Button from '@popup/popupX/shared/Button';
import { ButtonBase } from '@popup/popupX/shared/Button/Button';

export default function IconButton({ className, ...props }: ComponentProps<typeof ButtonBase>): JSX.Element {
    return <Button.Main label="" type="button" className={clsx('icon-button', className)} {...props} />;
}
