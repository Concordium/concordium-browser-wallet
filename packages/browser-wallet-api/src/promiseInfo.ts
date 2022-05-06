export type PromiseInfo<T> = {
    resolver: (value: PromiseLike<T> | T) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    reject: (reason?: any) => void;
};
