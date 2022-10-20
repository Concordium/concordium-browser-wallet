import React, { Suspense } from 'react';
import clsx from 'clsx';
import Button from '@popup/shared/Button';
import { TokenMetadata } from '@shared/storage/types';
import { integerToFractional } from 'wallet-common-helpers';
import { Atom, useAtomValue } from 'jotai';

interface ChooseTokenProps {
    balanceAtom: Atom<bigint>;
    metadata: TokenMetadata;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
}

interface BalanceProps extends Pick<ChooseTokenProps, 'balanceAtom'> {
    symbol: string | undefined;
    display: (amount: bigint) => string | undefined;
}

function Balance({ balanceAtom, display, symbol }: BalanceProps) {
    const balance = useAtomValue(balanceAtom);

    return (
        <p className="m-0">
            {display(balance) || '0'}
            {symbol}
        </p>
    );
}

export default function DisplayToken({ metadata, balanceAtom, className, ...props }: ChooseTokenProps) {
    const displayAmount = integerToFractional(metadata.decimals || 0);

    return (
        <Button className={clsx('display-token', className)} clear {...props}>
            <div className="create-transfer__token-display-container">
                <img alt={metadata.name} className="create-transfer__token-display" src={metadata.display?.url} />
                <Suspense fallback="">
                    <Balance balanceAtom={balanceAtom} symbol={metadata.symbol} display={displayAmount} />
                </Suspense>
            </div>
        </Button>
    );
}
