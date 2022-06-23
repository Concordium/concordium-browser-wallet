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
