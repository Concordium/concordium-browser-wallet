import React from 'react';
import { Atom, useAtomValue } from 'jotai';
import { addThousandSeparators, toFraction } from 'wallet-common-helpers';

type BalanceProps = {
    atom: Atom<Promise<bigint>>;
    decimals: number;
};

export default function TokenBalance({ atom, decimals }: BalanceProps) {
    const balance = useAtomValue(atom);
    const getFraction = toFraction(10 ** decimals);
    const renderBalance = (value: bigint) => addThousandSeparators(getFraction(value));

    return <>{renderBalance(balance)}</>;
}
