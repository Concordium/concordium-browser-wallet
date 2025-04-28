import clsx from 'clsx';
import React, { MouseEvent } from 'react';

interface RowProps {
    className?: string;
    left: string | JSX.Element | undefined;
    right: string | JSX.Element | undefined;
    onClick?(e: MouseEvent): void;
}

export default function SidedRow({ className, left, right, onClick }: RowProps): JSX.Element {
    return (
        // eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions
        <div className={clsx('sided-row__row', className)} onClick={onClick}>
            <div className={clsx('sided-row__left', className)}>{left}</div>
            <div className={clsx('sided-row__right', className)}>{right}</div>
        </div>
    );
}
