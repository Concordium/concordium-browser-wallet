import { toastsAtom } from '@popup/state';
import clsx from 'clsx';
import { useAtom } from 'jotai';
import React, { useEffect, useState } from 'react';

// The timeouts have to be aligned with the animations in the corresponding CSS.
const toastTimeoutMs = 5400;
const fadeoutTimeoutMs = 400;

export default function Toast() {
    const [toasts, setToasts] = useAtom(toastsAtom);
    const [toastText, setToastText] = useState<string>();
    const [fadeout, setFadeout] = useState<boolean>(false);

    useEffect(() => {
        if (!toastText && toasts.length > 0) {
            const [nextToast, ...remainderToasts] = toasts;
            setToastText(nextToast);
            setToasts(remainderToasts);
        }
    }, [toasts, toastText]);

    useEffect(() => {
        let timeout: NodeJS.Timeout | undefined;
        let fadeoutTimer: NodeJS.Timeout | undefined;

        if (toastText) {
            fadeoutTimer = setTimeout(() => {
                setFadeout(true);
                setTimeout(() => setFadeout(false), fadeoutTimeoutMs);
            }, toastTimeoutMs - fadeoutTimeoutMs);

            timeout = setTimeout(() => {
                setToastText(undefined);
            }, toastTimeoutMs);
        }
        return () => {
            if (timeout) {
                clearTimeout(timeout);
            }
            if (fadeoutTimer) {
                clearTimeout(fadeoutTimer);
            }
        };
    }, [toastText]);

    return <div className={clsx('toast', toastText && 'toast__show', fadeout && 'toast__fadeout')}>{toastText}</div>;
}
