import React, { useEffect } from 'react';
import { AccountTokens, contractBalancesFamily } from '@popup/store/token';
import { TokenIdAndMetadata } from '@shared/storage/types';
import { CCD_METADATA } from '@shared/constants/token-metadata';
import { TokenIdentifier } from '@shared/utils/token-helpers';
import { useAtomValue } from 'jotai';
import { noOp } from 'wallet-common-helpers';
import DisplayToken from './DisplayToken';

interface Props {
    onClick: (token: TokenIdentifier | undefined) => void;
    tokens?: AccountTokens;
    ccdBalance: bigint;
    address: string;
    setDetailsExpanded: (expanded: boolean) => void;
}

interface CollectionProps extends Pick<Props, 'onClick' | 'address'> {
    tokens: TokenIdAndMetadata[];
    contractIndex: string;
}

function Collection({ onClick, tokens, contractIndex, address }: CollectionProps) {
    const balances = useAtomValue(contractBalancesFamily(address, contractIndex));

    return (
        <>
            {tokens
                .filter((token) => balances[token.id] > 0n)
                .map((token) => (
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

export default function PickToken({ onClick, tokens, ccdBalance, address, setDetailsExpanded }: Props) {
    useEffect(() => {
        if (Object.values(tokens || []).reduce((tokenCount, collection) => collection.length + tokenCount, 0) > 3) {
            setDetailsExpanded(false);
            return () => setDetailsExpanded(true);
        }
        return noOp;
    }, []);

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
