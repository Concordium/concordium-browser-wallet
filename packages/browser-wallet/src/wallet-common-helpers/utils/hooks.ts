import { Dispatch, SetStateAction, useEffect, useRef, useState } from 'react';

export const useIsSubsequentRender = () => {
    const ref = useRef<boolean>(false);

    useEffect(() => {
        ref.current = true;
    }, [ref]);

    return ref.current;
};

export const useUpdateEffect: typeof useEffect = (effect, deps) => {
    const isSubsequentRender = useIsSubsequentRender();

    useEffect(() => {
        if (!isSubsequentRender) {
            return undefined;
        }
        return effect();
    }, deps);
};

/** Calls function at a given rate */
export function useInterval(fn: () => void, rate: number, enable = true) {
    useEffect(() => {
        if (enable) {
            const interval = setInterval(fn, rate);
            return () => clearInterval(interval);
        }
        return () => {};
    }, [enable, fn, rate]);
}

/** Hook for getting the current time, optionally taking a refresh frequency in
 * milliseconds defaulting to 1 second */
export function useCurrentTime(refreshRate = 1000) {
    const [time, setTime] = useState(new Date());
    useInterval(() => setTime(new Date()), refreshRate);
    return time;
}

/**
 * Like a regular useState hook, but resets to initial value after given timeout (in MS).
 */
export const useTimeoutState = <TValue>(
    initial: TValue,
    timeoutMS?: number
): [TValue, Dispatch<SetStateAction<TValue>>] => {
    const [value, setValue] = useState<TValue>(initial);

    const set: typeof setValue = (v) => {
        setValue(v);

        if (v !== initial) {
            setTimeout(() => setValue(initial), timeoutMS);
        }
    };

    return [value, set];
};

export const useAsyncMemo = <ReturnType>(
    getResult: () => Promise<ReturnType>,
    handleError: (e: Error) => void = () => {},
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    deps?: any[]
): ReturnType | undefined => {
    const [result, setResult] = useState<ReturnType>();
    useEffect(() => {
        getResult().then(setResult).catch(handleError);
    }, deps);
    return result;
};
