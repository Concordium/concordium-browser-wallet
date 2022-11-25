import { trunctateSymbol } from '@shared/utils/token-helpers';
import { useTranslation } from 'react-i18next';
import React from 'react';
import { addThousandSeparators, integerToFractional, pipe } from 'wallet-common-helpers';

type BalanceProps = {
    balance?: bigint;
    decimals: number;
    symbol?: string;
};

export default function TokenBalance({ balance, decimals, symbol = '' }: BalanceProps) {
    const renderBalance = pipe(integerToFractional(decimals), addThousandSeparators);
    const hasBalance = balance !== undefined;
    const { t } = useTranslation('shared');

    return (
        <>
            {hasBalance && (
                <>
                    {renderBalance(balance)} {trunctateSymbol(symbol)}
                </>
            )}
            {!hasBalance && <i>{t('tokenBalance.noBalance')}</i>}
        </>
    );
}
