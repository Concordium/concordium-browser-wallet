export type PromiseInfo<T> = {
    resolver: (value: PromiseLike<T> | T) => void;
    reject: (reason?: any) => void;
};
