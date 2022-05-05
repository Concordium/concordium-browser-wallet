export function isDefined<T>(v?: T): v is T {
    return v !== undefined;
}

export const notNull = <T>(v: T | null | undefined): v is T => v != null;

export function noOp(): void {}

export async function asyncNoOp(): Promise<void> {
    // eslint-disable-next-line no-promise-executor-return
    return Promise.resolve();
}
