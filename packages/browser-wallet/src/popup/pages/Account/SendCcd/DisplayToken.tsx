import React from 'react';
import clsx from 'clsx';
import Button from '@popup/shared/Button';
import { TokenMetadata } from '@shared/storage/types';
import TokenBalance from '../Tokens/TokenBalance';

interface ChooseTokenProps {
    balance: bigint;
    metadata: TokenMetadata;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
}

export default function DisplayToken({ metadata, balance, className, ...props }: ChooseTokenProps) {
    return (
        <Button className={clsx('display-token', className)} clear {...props}>
            <div className="create-transfer__token-display-container">
                <img alt={metadata.name} className="create-transfer__token-display" src={metadata.display?.url} />
                <TokenBalance decimals={metadata.decimals || 0} symbol={metadata.symbol} balance={balance} />
            </div>
        </Button>
    );
}
