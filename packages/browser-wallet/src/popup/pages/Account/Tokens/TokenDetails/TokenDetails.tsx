import React, { Suspense, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';

import { useSelectedCredential } from '@popup/shared/utils/account-helpers';
import { contractBalancesFamily } from '@popup/store/token';
import TokenBalance from '../TokenBalance';
import { defaultCis2TokenId } from '../routes';
import { TokenDetails, useTokens } from '../utils';

type TokenDetailsRouteParams = {
    contractIndex: string;
    id: string;
};

type DetailsProps = {
    token: TokenDetails;
};

function Nft({ token }: DetailsProps) {
    return <>NFT: {token.id}</>;
}

function Ft({ token }: DetailsProps) {
    const account = useSelectedCredential();
    const balancesAtom = contractBalancesFamily(account?.address ?? '', token.contractIndex);

    return (
        <Suspense fallback={<>...</>}>
            <TokenBalance atom={balancesAtom} decimals={token.metadata.decimals ?? 0} id={token.id} />
        </Suspense>
    );
}

function useTokenDetails(): TokenDetails | undefined {
    const account = useSelectedCredential();
    const { contractIndex, id } = useParams<TokenDetailsRouteParams>();
    const tokenId = useMemo(() => (id === defaultCis2TokenId ? '' : id), [id]);
    const tokens = useTokens(account);

    return tokens.find((t) => t.contractIndex === contractIndex && t.id === tokenId);
}

type Props = {
    setDetailsExpanded(expanded: boolean): void;
};

export default function Details({ setDetailsExpanded }: Props) {
    const token = useTokenDetails();

    useEffect(() => {
        setDetailsExpanded(false);
        return () => setDetailsExpanded(true);
    }, []);

    if (token === undefined) {
        return null;
    }

    const Token = token.metadata.unique ? Nft : Ft;

    return <Token token={token} />;
}
