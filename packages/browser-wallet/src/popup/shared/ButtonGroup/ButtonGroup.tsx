import clsx from 'clsx';
import React, { ReactElement } from 'react';
import { ClassName, PropsOf } from 'wallet-common-helpers';
import Button from '../Button';

type Props = ClassName & {
    /**
     * A list (> 1) of \<Button\> elements
     */
    children: ReactElement<PropsOf<typeof Button>>[];
};

/**
 * @description
 * Used to align buttons horizontally.
 */
export default function ButtonGroup({ children, className }: Props) {
    return <div className={clsx('button-group', className)}>{children}</div>;
}
