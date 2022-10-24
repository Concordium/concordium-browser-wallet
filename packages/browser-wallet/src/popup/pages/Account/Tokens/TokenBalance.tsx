import React, { ReactNode } from 'react';
import { addThousandSeparators, integerToFractional } from 'wallet-common-helpers';

type BalanceProps = {
    balance: bigint;
    decimals: number;
    symbol?: string;
    children?(balance: bigint): ReactNode;
};

export default function TokenBalance({ balance, decimals, children, symbol }: BalanceProps) {
    const renderBalance =
        children ?? ((value: bigint) => addThousandSeparators(integerToFractional(decimals)(value)) + (symbol || ''));

    return <>{renderBalance(balance)}</>;
}
