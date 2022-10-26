import React from 'react';
import { addThousandSeparators, integerToFractional } from 'wallet-common-helpers';

type BalanceProps = {
    balance: bigint;
    decimals: number;
    symbol?: string;
};

export default function TokenBalance({ balance, decimals, symbol }: BalanceProps) {
    const renderBalance = (value: bigint) =>
        addThousandSeparators(integerToFractional(decimals)(value)) + (symbol || '');

    return <>{renderBalance(balance)}</>;
}
