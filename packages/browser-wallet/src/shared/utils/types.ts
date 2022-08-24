/* eslint-disable @typescript-eslint/ban-types */
import { RefAttributes } from 'react';
/**
 * @description
 * Makes keys of type optional
 *
 * @example
 * type PartiallyOptionalProps = MakeOptional<{test: string; another: number;}, 'another'>; // {test: string; another?: number;}
 */
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

export type WithRef<P, R> = P & RefAttributes<R>;

export enum BackgroundResponseStatus {
    Success = 'Success',
    Aborted = 'Aborted',
    Error = 'Error',
}
