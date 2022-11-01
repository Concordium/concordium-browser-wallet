import React from 'react';
import clsx from 'clsx';
import Button from '@popup/shared/Button';
import { TokenMetadata } from '@shared/storage/types';
import TokenBalance from '@popup/shared/TokenBalance';

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
            <div className="display-token__token-display-container">
                <img alt={metadata.name} className="display-token__token-display" src={metadata.display?.url} />
                <div className="text-right">
                    {metadata.name}
                    <div className="display-token__balance">
                        <TokenBalance decimals={metadata.decimals || 0} symbol={metadata.symbol} balance={balance} />
                    </div>
                </div>
            </div>
        </Button>
    );
}
