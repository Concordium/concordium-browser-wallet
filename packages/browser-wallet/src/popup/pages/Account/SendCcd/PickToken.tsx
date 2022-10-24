import React from 'react';
import { AccountTokens, contractBalancesFamily } from '@popup/store/token';
import { TokenIdAndMetadata } from '@shared/storage/types';
import { CCD_METADATA, TokenIdentifier } from '@shared/utils/token-helpers';
import { useAtomValue } from 'jotai';
import DisplayToken from './DisplayToken';

interface Props {
    onClick: (token: TokenIdentifier | undefined) => void;
    tokens?: AccountTokens;
    ccdBalance: bigint;
    address: string;
}

interface CollectionProps extends Pick<Props, 'onClick' | 'address'> {
    tokens: TokenIdAndMetadata[];
    contractIndex: string;
}

function Collection({ onClick, tokens, contractIndex, address }: CollectionProps) {
    const balances = useAtomValue(contractBalancesFamily(address, contractIndex));

    return (
        <>
            {tokens.map((token) => (
                <DisplayToken
                    className="create-transfer__pick-token-element"
                    key={token.id}
                    metadata={token.metadata}
                    balance={balances[token.id]}
                    onClick={() => onClick({ contractIndex, tokenId: token.id, metadata: token.metadata })}
                />
            ))}
        </>
    );
}

export default function PickToken({ onClick, tokens, ccdBalance, address }: Props) {
    return (
        <div className="create-transfer__pick-token">
            <DisplayToken
                className="create-transfer__pick-token-element"
                metadata={CCD_METADATA}
                onClick={() => onClick(undefined)}
                balance={ccdBalance}
            />
            {Object.entries(tokens || []).map(([contractIndex, collectionTokens]) => (
                <Collection
                    key={contractIndex}
                    address={address}
                    contractIndex={contractIndex}
                    tokens={collectionTokens}
                    onClick={onClick}
                />
            ))}
        </div>
    );
}
