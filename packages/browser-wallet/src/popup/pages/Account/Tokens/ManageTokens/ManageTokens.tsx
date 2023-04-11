import React, { useContext, useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Navigate, Route, Routes, useLocation, useNavigate, Location } from 'react-router-dom';
import { useUpdateEffect } from 'wallet-common-helpers';

import { ContractTokenDetails } from '@shared/utils/token-helpers';
import TokenDetails from '@popup/shared/TokenDetails';
import { selectedAccountAtom } from '@popup/store/account';
import { ensureDefined } from '@shared/utils/basic-helpers';
import { contractBalancesFamily, currentAccountTokensAtom } from '@popup/store/token';
import {
    checkedTokensAtom,
    contractDetailsAtom,
    listScrollPositionAtom,
    searchAtom,
    searchResultAtom,
    topTokensAtom,
} from './state';
import { manageTokensRoutes, DetailsLocationState } from './utils';
import TokenList from './TokenList';
import { accountPageContext } from '../../utils';

function Details() {
    const { state } = useLocation() as Location & { state?: DetailsLocationState };
    const nav = useNavigate();
    if (state === undefined) {
        return <Navigate to=".." />;
    }

    const { contractIndex, token, balance } = state;

    return (
        <TokenDetails
            contractIndex={contractIndex.toString()}
            balance={balance}
            token={token}
            onClose={() => nav(-1)}
        />
    );
}

export default function AddTokens() {
    const accountTokens = useAtomValue(currentAccountTokensAtom);
    const contractDetails = useAtomValue(contractDetailsAtom);
    const account = ensureDefined(useAtomValue(selectedAccountAtom), 'Expected account to be selected');
    const currentContractBalances = useAtomValue(
        contractBalancesFamily(account, contractDetails?.index.toString() ?? '')
    );
    const nav = useNavigate();
    const { setDetailsExpanded } = useContext(accountPageContext);

    useEffect(() => {
        setDetailsExpanded(false);
        return () => setDetailsExpanded(true);
    }, []);

    const setChecked = useSetAtom(checkedTokensAtom);
    const setTopTokens = useSetAtom(topTokensAtom);

    // Keep the following in memory while manage token flow lives
    useAtom(checkedTokensAtom);
    useAtom(topTokensAtom);
    useAtom(searchAtom);
    useAtom(searchResultAtom);
    useAtom(listScrollPositionAtom);

    useEffect(() => {
        if (contractDetails?.index !== undefined && !accountTokens.loading) {
            const currentChecked: ContractTokenDetails[] =
                accountTokens.value[contractDetails.index.toString()]?.map((token) => ({
                    ...token,
                    balance: currentContractBalances[token.id] ?? 0n,
                })) ?? [];

            setTopTokens(currentChecked);
            setChecked(currentChecked.map((t) => t.id));
        }
    }, [contractDetails?.index, accountTokens.loading]);

    useUpdateEffect(() => {
        nav('..');
    }, [account]);

    return (
        <Routes>
            <Route index element={<TokenList />} />
            <Route path={manageTokensRoutes.details} element={<Details />} />
        </Routes>
    );
}
