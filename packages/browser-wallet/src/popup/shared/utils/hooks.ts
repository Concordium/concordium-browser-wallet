import { useEffect, useRef } from 'react';

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
