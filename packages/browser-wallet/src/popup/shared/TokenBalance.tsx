import React from 'react';
import { addThousandSeparators, integerToFractional, pipe } from 'wallet-common-helpers';

type BalanceProps = {
    balance: bigint;
    decimals: number;
    symbol?: string;
};

export default function TokenBalance({ balance, decimals, symbol }: BalanceProps) {
    const renderBalance = pipe(integerToFractional(decimals), addThousandSeparators);

    return (
        <>
            {renderBalance(balance)} {symbol ?? ''}
        </>
    );
}
