import React, { ReactNode } from 'react';
import clsx from 'clsx';
import Text from '@popup/popupX/shared/Text';

export default function Tooltip({
    title,
    text,
    className,
    position = 'top',
    children,
}: {
    title?: string;
    text?: string;
    className?: string;
    position?: 'top' | 'bottom';
    children: ReactNode;
}) {
    return (
        <div className={clsx('tooltip-x', className)}>
            <span className={clsx('tooltip-x_text', position)}>
                <Text.MainMedium>{title}</Text.MainMedium>
                <Text.Capture>{text}</Text.Capture>
            </span>
            {children}
        </div>
    );
}
