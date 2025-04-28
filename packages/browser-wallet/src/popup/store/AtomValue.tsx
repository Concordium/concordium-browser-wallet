import { Atom, useAtomValue } from 'jotai';
import React, { ReactNode } from 'react';

type Awaited<T> = T extends Promise<infer V> ? Awaited<V> : T; // from jotai
type Props<T> = { atom: Atom<T>; children(v: Awaited<T>): ReactNode };

export default function AtomValue<T>({ atom, children }: Props<T>) {
    const value = useAtomValue<T>(atom);
    return <>{children(value)}</>;
}
