import { toastsAtom } from '@popup/state';
import clsx from 'clsx';
import { useAtom } from 'jotai';
import React, { ReactNode, useEffect, useState } from 'react';
import { noOp } from 'wallet-common-helpers';

// The fadeout timeout has to be aligned with the animation in the corresponding CSS. This is
// done by manually tweaking the values until the animation looks decent. Currently the value
// is 100ms less than the corresponding value in CSS.
const fadeoutTimeoutMs = 400;

// Determines how long we display the toast.
const toastTimeoutMs = 5000;

export default function Toast() {
    const [toasts, setToasts] = useAtom(toastsAtom);
    const [toastText, setToastText] = useState<string | ReactNode>();
    const [fadeout, setFadeout] = useState<boolean>(false);

    useEffect(() => {
        if (!toastText && toasts.length > 0) {
            const [nextToast, ...remainderToasts] = toasts;
            setToastText(nextToast);
            setToasts(remainderToasts);
        }
    }, [toasts, toastText]);

    useEffect(() => {
        if (toastText) {
            const fadeoutTimer = setTimeout(() => {
                setFadeout(true);
                setTimeout(() => setFadeout(false), fadeoutTimeoutMs);
            }, toastTimeoutMs - fadeoutTimeoutMs);

            const timeout = setTimeout(() => {
                setToastText(undefined);
            }, toastTimeoutMs);

            return () => {
                clearTimeout(timeout);
                clearTimeout(fadeoutTimer);
            };
        }
        return noOp;
    }, [toastText]);

    return <div className={clsx('toast', toastText && 'toast__show', fadeout && 'toast__fadeout')}>{toastText}</div>;
}
