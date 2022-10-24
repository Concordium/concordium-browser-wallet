import React, { ReactNode } from 'react';
import { addThousandSeparators, toFraction } from 'wallet-common-helpers';

type BalanceProps = {
    balance: bigint;
    decimals: number;
    children?(balance: bigint): ReactNode;
};

export default function TokenBalance({ balance, decimals, children }: BalanceProps) {
    const getFraction = toFraction(10 ** decimals);
    const renderBalance = children ?? ((value: bigint) => addThousandSeparators(getFraction(value)));

    return <>{renderBalance(balance)}</>;
}
