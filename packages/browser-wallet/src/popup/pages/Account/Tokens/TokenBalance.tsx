import React from 'react';
import { addThousandSeparators, toFraction } from 'wallet-common-helpers';

type BalanceProps = {
    balance: bigint;
    decimals: number;
};

export default function TokenBalance({ balance, decimals }: BalanceProps) {
    const getFraction = toFraction(10 ** decimals);
    const renderBalance = (value: bigint) => addThousandSeparators(getFraction(value));

    return <>{renderBalance(balance)}</>;
}
