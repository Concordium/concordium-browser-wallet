import { atom } from 'jotai';
import { MakeOptional } from 'wallet-common-helpers';

import { selectedAccountAtom } from '@popup/store/account';
import { grpcClientAtom } from '@popup/store/settings';
import { ensureDefined } from '@shared/utils/basic-helpers';
import { ContractDetails, ContractTokenDetails } from '@shared/utils/token-helpers';
import { AsyncWrapper, resetOnUnmountAtom } from '@popup/store/utils';
import { fetchTokensConfigure, FetchTokensResponse } from './utils';

type Action<T extends string | number> = {
    type: T;
};

type TokensResetAction = Action<'reset'> & {
    initialTokens: FetchTokensResponse;
};

type TokensNextAction = Action<'next'>;

type TokensAtomAction = TokensResetAction | TokensNextAction;

type TokenWithPageID = MakeOptional<ContractTokenDetails, 'metadata'> & {
    pageId: number;
};

export const contractDetailsAtom = resetOnUnmountAtom<ContractDetails | undefined>(undefined);

type ContractTokens = {
    hasMore: boolean;
    loading: boolean;
    tokens: ContractTokenDetails[];
};

export const contractTokensAtom = (() => {
    const listAtom = resetOnUnmountAtom<TokenWithPageID[]>([]);
    const loadingAtom = resetOnUnmountAtom(false);
    const hasMoreAtom = resetOnUnmountAtom(true);

    const derived = atom<ContractTokens, TokensAtomAction, Promise<void>>(
        (get) => {
            const tokens = get(listAtom).map(({ pageId, ...td }) => td as ContractTokenDetails);

            return {
                hasMore: get(hasMoreAtom),
                loading: get(loadingAtom),
                tokens,
            };
        },
        async (get, set, update) => {
            switch (update.type) {
                case 'reset': {
                    const { tokens, hasMore } = update.initialTokens;
                    set(listAtom, tokens);
                    set(hasMoreAtom, hasMore);

                    break;
                }
                case 'next': {
                    const contractDetails = ensureDefined(get(contractDetailsAtom), 'Needs contract details');
                    const account = ensureDefined(get(selectedAccountAtom), 'No account has been selected');
                    const client = get(grpcClientAtom);
                    const fetchTokens = fetchTokensConfigure(contractDetails, client, account);

                    set(loadingAtom, true);

                    const tokens = get(listAtom);
                    const topId = tokens[tokens.length - 1]?.pageId;

                    const { hasMore, tokens: next } = await fetchTokens(topId);

                    set(hasMoreAtom, hasMore);
                    set(loadingAtom, false);
                    set(listAtom, (ts) => [...ts, ...next]);
                    break;
                }
                default: {
                    throw new Error('Unsuported update type');
                }
            }
        }
    );

    return derived;
})();

export const topTokensAtom = resetOnUnmountAtom<ContractTokenDetails[]>([]);
export const checkedTokensAtom = resetOnUnmountAtom<string[]>([]);
export const searchAtom = resetOnUnmountAtom<string>('');
export const searchResultAtom = resetOnUnmountAtom<AsyncWrapper<ContractTokenDetails[] | undefined>>({
    loading: false,
    value: undefined,
});
export const listScrollPositionAtom = resetOnUnmountAtom<number>(0);
