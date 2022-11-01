import React, { useContext, useEffect, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { useSelectedCredential } from '@popup/shared/utils/account-helpers';
import { contractBalancesFamily } from '@popup/store/token';
import AtomValue from '@popup/store/AtomValue';
import TokenDetails from '@popup/shared/TokenDetails';
import { defaultCis2TokenId } from './routes';
import { AccountTokenDetails, useFlattenedAccountTokens } from './utils';
import { accountPageContext } from '../utils';

type TokenDetailsRouteParams = {
    contractIndex: string;
    id: string;
};

function useAccountTokenDetails(): AccountTokenDetails | undefined {
    const account = useSelectedCredential();
    const { contractIndex, id } = useParams<TokenDetailsRouteParams>();
    const tokenId = useMemo(() => (id === defaultCis2TokenId ? '' : id), [id]);
    const tokens = useFlattenedAccountTokens(account);

    return tokens.find((t) => t.contractIndex === contractIndex && t.id === tokenId);
}

export default function Details() {
    const token = useAccountTokenDetails();
    const account = useSelectedCredential();
    const balancesAtom = contractBalancesFamily(account?.address ?? '', token?.contractIndex ?? '');
    const { setDetailsExpanded } = useContext(accountPageContext);
    const nav = useNavigate();

    useEffect(() => {
        setDetailsExpanded(false);
        return () => setDetailsExpanded(true);
    }, []);

    if (token === undefined) {
        return null;
    }

    const { contractIndex, ...tokenDetails } = token;

    return (
        <AtomValue atom={balancesAtom}>
            {({ [token.id]: b }) => (
                <TokenDetails
                    token={tokenDetails}
                    contractIndex={contractIndex}
                    balance={b}
                    onClose={() => nav(-1)}
                    canRemove
                />
            )}
        </AtomValue>
    );
}
