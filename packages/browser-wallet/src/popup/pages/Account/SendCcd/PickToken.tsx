import { AccountTokens, contractBalancesFamily } from '@popup/store/token';
import { TokenIdAndMetadata } from '@shared/storage/types';
import { CCD_METADATA, ContractBalances, TokenIdentifier } from '@shared/utils/token-helpers';
import { Atom, useAtomValue } from 'jotai';
import React, { Suspense } from 'react';
import DisplayToken from './DisplayToken';

interface Props {
    onClick: (token: TokenIdentifier | undefined) => void;
    tokens?: AccountTokens;
    ccdBalance: bigint;
    address: string;
}

interface CollectionProps extends Pick<Props, 'onClick'> {
    atom: Atom<Promise<ContractBalances>>;
    tokens: TokenIdAndMetadata[];
    contractIndex: string;
}

function Collection({ atom, onClick, tokens, contractIndex }: CollectionProps) {
    const balances = useAtomValue(atom);

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
                <Suspense fallback="">
                    <Collection
                        key={contractIndex}
                        {...{
                            atom: contractBalancesFamily(address, contractIndex),
                            contractIndex,
                            tokens: collectionTokens,
                            onClick,
                        }}
                    />
                </Suspense>
            ))}
        </div>
    );
}
