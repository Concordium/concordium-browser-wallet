import { AccountTokens } from '@popup/store/token';
import { CCD_METADATA, TokenIdentifier } from '@shared/utils/token-helpers';
import React from 'react';
import DisplayToken from './DisplayToken';

interface Props {
    onClick: (token: TokenIdentifier | undefined) => void;
    tokens?: AccountTokens;
    ccdBalance: bigint;
}

// TODO use cbf atom to get balances (when it has been merged)
export default function PickToken({ onClick, tokens, ccdBalance }: Props) {
    return (
        <div className="create-transfer__pick-token">
            <DisplayToken
                className="create-transfer__pick-token-element"
                metadata={CCD_METADATA}
                onClick={() => onClick(undefined)}
                balance={ccdBalance}
            />
            {Object.entries(tokens || []).map(([contractIndex, collectionTokens]) =>
                collectionTokens.map((token) => (
                    <DisplayToken
                        className="create-transfer__pick-token-element"
                        key={`${contractIndex}+${token.id}`}
                        metadata={token.metadata}
                        onClick={() => onClick({ contractIndex, tokenId: token.id, metadata: token.metadata })}
                    />
                ))
            )}
        </div>
    );
}
