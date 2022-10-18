import React from 'react';
import clsx from 'clsx';
import Button from '@popup/shared/Button';
import { TokenMetadata } from '@shared/storage/types';
import { integerToFractional } from 'wallet-common-helpers';

interface ChooseTokenProps {
    balance?: bigint;
    metadata: TokenMetadata;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
}

export default function DisplayToken({ metadata, balance = 0n, className, ...props }: ChooseTokenProps) {
    const displayAmount = integerToFractional(metadata.decimals || 0);

    return (
        <Button className={clsx('display-token', className)} clear {...props}>
            <div className="create-transfer__token-display-container">
                <img alt={metadata.name} className="create-transfer__token-display" src={metadata.display?.url} />
                <p className="m-0">
                    {displayAmount(balance) || '0'}
                    {metadata.symbol}
                </p>
            </div>
        </Button>
    );
}
