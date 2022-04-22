/**
 * Takes an async function, which might return undefined, and throws an error instead.
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
