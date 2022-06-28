import React from 'react';
import clsx from 'clsx';

import Button, { ButtonProps } from '../Button';

export type IconButtonProps = Omit<ButtonProps, 'clear'>;

export default function IconButton({ className, ...props }: IconButtonProps): JSX.Element {
    return <Button type="button" clear className={clsx('icon-button', className)} {...props} />;
}
