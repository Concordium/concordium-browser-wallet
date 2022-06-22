import { ClassName } from '@shared/utils/types';
import clsx from 'clsx';
import React, { forwardRef, PropsWithChildren } from 'react';

type Props = PropsWithChildren<ClassName>;

const NavList = forwardRef<HTMLDivElement, Props>(({ className, children }, ref) => {
    return (
        <div className={clsx('nav-list', className)} ref={ref}>
            {children}
        </div>
    );
});

export default NavList;
