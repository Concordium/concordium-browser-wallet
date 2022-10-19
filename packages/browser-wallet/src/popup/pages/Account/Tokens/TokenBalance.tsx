import React, { ReactNode } from 'react';
import { Atom, useAtomValue } from 'jotai';
import { addThousandSeparators, toFraction } from 'wallet-common-helpers';
import { ContractBalances } from '@shared/utils/token-helpers';

type BalanceProps = {
    atom: Atom<Promise<ContractBalances>>;
    id: string;
    decimals: number;
    children?(balance: bigint): ReactNode;
};

export default function TokenBalance({ atom, decimals, children, id }: BalanceProps) {
    const balances = useAtomValue(atom);
    const getFraction = toFraction(10 ** decimals);
    const renderBalance = children ?? ((value: bigint) => addThousandSeparators(getFraction(value)));

    return <>{renderBalance(balances[id])}</>;
}
