import { ClassName } from '@shared/utils/types';
import clsx from 'clsx';
import React, { PropsWithChildren } from 'react';

type Props = PropsWithChildren<ClassName>;

export default function NavList({ className, children }: Props) {
    return <div className={clsx('nav-list', className)}>{children}</div>;
}
