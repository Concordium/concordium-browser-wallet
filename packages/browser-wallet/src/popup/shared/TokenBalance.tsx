import React from 'react';
import { addThousandSeparators, integerToFractional, pipe } from 'wallet-common-helpers';

const MAX_SYMBOL_LENGTH = 10;

type BalanceProps = {
    balance: bigint;
    decimals: number;
    symbol?: string;
};

export default function TokenBalance({ balance, decimals, symbol = '' }: BalanceProps) {
    const truncatedSymbol = symbol.length > MAX_SYMBOL_LENGTH ? `${symbol.substring(0, MAX_SYMBOL_LENGTH)}...` : symbol;
    const renderBalance = pipe(integerToFractional(decimals), addThousandSeparators);

    return (
        <>
            {renderBalance(balance)} {truncatedSymbol}
        </>
    );
}
