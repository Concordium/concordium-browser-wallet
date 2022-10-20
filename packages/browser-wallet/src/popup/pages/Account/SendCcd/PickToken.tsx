import { AccountTokens, contractBalancesFamily } from '@popup/store/token';
import { TokenIdAndMetadata } from '@shared/storage/types';
import { CCD_METADATA, ContractBalances, TokenIdentifier } from '@shared/utils/token-helpers';
import { atom, Atom } from 'jotai';
import { selectAtom } from 'jotai/utils';
import React, { Suspense } from 'react';
import DisplayToken from './DisplayToken';

interface Props {
    onClick: (token: TokenIdentifier | undefined) => void;
    tokens?: AccountTokens;
    ccdBalance: bigint;
    address: string;
}

interface CollectionProps extends Pick<Props, 'onClick'> {
    balanceAtom: Atom<Promise<ContractBalances>>;
    tokens: TokenIdAndMetadata[];
    contractIndex: string;
}

function Collection({ balanceAtom, onClick, tokens, contractIndex }: CollectionProps) {
    return (
        <>
            {tokens.map((token) => (
                <DisplayToken
                    className="create-transfer__pick-token-element"
                    key={token.id}
                    metadata={token.metadata}
                    balanceAtom={selectAtom(balanceAtom, (balances) => balances[token.id])}
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
                balanceAtom={atom(() => ccdBalance)}
            />
            {Object.entries(tokens || []).map(([contractIndex, collectionTokens]) => (
                <Suspense fallback="">
                    <Collection
                        key={contractIndex}
                        {...{
                            balanceAtom: contractBalancesFamily(address, contractIndex),
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
