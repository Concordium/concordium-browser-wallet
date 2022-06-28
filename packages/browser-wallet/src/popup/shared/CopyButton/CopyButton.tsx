import React, { useEffect, MouseEventHandler } from 'react';
import clsx from 'clsx';

import CopyIcon from '@assets/svg/copy.svg';
import CheckmarkIcon from '@assets/svg/checkmark-blue.svg';
import IconButton, { IconButtonProps } from '../IconButton';
import { useTimeoutState } from '../utils/hooks';

type Props = Omit<IconButtonProps, 'children'> & {
    value: string;
};

/**
 * Button, that, when pressed, copies the given value into the user's clipboard.
 */
export default function CopyButton({ value, className, onClick, ...props }: Props): JSX.Element {
    const [copied, setCopied] = useTimeoutState(false, 2000);

    useEffect(() => setCopied(false), [value]);

    const handleOnClick: MouseEventHandler<HTMLButtonElement> = async (ev) => {
        try {
            await navigator.clipboard.writeText(value);
            setCopied(true);
            onClick?.(ev);
        } catch (e) {
            // TODO: logging.
        }
    };

    return (
        <IconButton {...props} className={clsx('copy-button', className)} onClick={handleOnClick}>
            {copied ? <CheckmarkIcon className="copy-button__check" /> : <CopyIcon />}
        </IconButton>
    );
}
