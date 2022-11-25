import React from 'react';
import clsx from 'clsx';
import Button from '@popup/shared/Button';
import { TokenMetadata } from '@shared/storage/types';
import TokenBalance from '@popup/shared/TokenBalance';
import { getMetadataDecimals } from '@shared/utils/token-helpers';
import Img from '@popup/shared/Img';

interface ChooseTokenProps {
    balance?: bigint;
    metadata: TokenMetadata;
    onClick: () => void;
    disabled?: boolean;
    className?: string;
    icon?: JSX.Element;
}

export default function DisplayToken({ metadata, balance, className, icon, ...props }: ChooseTokenProps) {
    return (
        <Button className={clsx('display-token', className)} clear {...props}>
            <div className="display-token__token-display-container">
                {icon ? (
                    <div className="display-token__token-display">{icon}</div>
                ) : (
                    <Img
                        alt={metadata.name}
                        className="display-token__token-display"
                        src={metadata.thumbnail?.url ?? metadata.display?.url}
                        withDefaults
                    />
                )}
                <div className="display-token__details">
                    <div className="clamp-1 w-full">{metadata.name}</div>
                    <div className="display-token__balance">
                        <TokenBalance
                            decimals={getMetadataDecimals(metadata)}
                            symbol={metadata.symbol}
                            balance={balance}
                        />
                    </div>
                </div>
            </div>
        </Button>
    );
}
