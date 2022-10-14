import { sleep } from 'wallet-common-helpers';

/**
 * Takes a function which might return undefined, and throws an error instead.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function throwIfUndefined<T extends any[], V>(
    func: (...inputs: T) => V | undefined,
    getErrorMessage: (...inputs: T) => string
): (...inputs: T) => V {
    return (...inputs) => {
        const result = func(...inputs);
        if (!result) {
            throw new Error(getErrorMessage(...inputs));
        }
        return result;
    };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function not<T extends any[]>(predicate: (...inputs: T) => boolean) {
    return (...inputs: T): boolean => !predicate(...inputs);
}

type ShouldLoop = boolean;

/**
 * Takes a loopFun, that runs each interval, for as long as the loopFun resolves to true
 */
export const loop = async (intervalMS: number, loopFun: () => Promise<ShouldLoop>) => {
    const run = async () => {
        if (await loopFun()) {
            await sleep(intervalMS).then(run);
        }
    };
    await run();
};
