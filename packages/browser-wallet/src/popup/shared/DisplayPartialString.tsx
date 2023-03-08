import React from 'react';
import Modal from '@popup/shared/Modal';
import clsx from 'clsx';

const DEFAULT_MAX_LENGTH = 64;

interface Props {
    maxLength?: string;
    className?: string;
    value: string;
}

/**
 * Given a string, will limit the display to maxLength characters and if the value's length exceeds that, the display becomes a trigger for a modal displaying the entire value.
 */
export default function DisplayPartialString({ value, className, maxLength = DEFAULT_MAX_LENGTH }: Props) {
    if (value.length <= maxLength) {
        return <div className={className}>{value}</div>;
    }

    return (
        <Modal
            trigger={<div className={clsx('pointer-cursor', className)}>{value.substring(0, maxLength - 3)}...</div>}
            open={false}
        >
            <div className="word-break-all m-t-20">{value}</div>
        </Modal>
    );
}
