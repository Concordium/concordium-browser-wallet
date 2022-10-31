import { atom, PrimitiveAtom } from 'jotai';
import { isDefined, MakeOptional } from 'wallet-common-helpers';

import { selectedAccountAtom } from '@popup/store/account';
import { jsonRpcClientAtom, networkConfigurationAtom } from '@popup/store/settings';
import { ensureDefined } from '@shared/utils/basic-helpers';
import { ContractDetails } from '@shared/utils/token-helpers';
import { ContractTokenDetails, fetchTokensConfigure } from './utils';

type TokensAtomAction = 'reset' | 'next';

type TokenWithPageID = MakeOptional<ContractTokenDetails, 'metadata'> & {
    pageId: number;
};

function resetOnUnmountAtom<V>(initial: V): PrimitiveAtom<V> {
    const a = atom<V>(initial);
    a.onMount = (set) => () => set(initial);
    return a;
}

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
            const tokens = get(listAtom)
                .filter((td) => isDefined(td.metadata))
                .map(({ pageId, ...td }) => td as ContractTokenDetails);

            return {
                hasMore: get(hasMoreAtom),
                loading: get(loadingAtom),
                tokens,
            };
        },
        async (get, set, update) => {
            const contractDetails = ensureDefined(get(contractDetailsAtom), 'Needs contract details');
            const account = ensureDefined(get(selectedAccountAtom), 'No account has been selected');
            const client = get(jsonRpcClientAtom);
            const network = get(networkConfigurationAtom);
            const fetchTokens = fetchTokensConfigure(contractDetails, client, network, account);
            let topId: number | undefined;

            set(loadingAtom, true);

            switch (update) {
                case 'reset': {
                    set(listAtom, []);
                    set(hasMoreAtom, true);
                    break;
                }
                case 'next': {
                    const tokens = get(listAtom);
                    topId = [...tokens].reverse()[0]?.pageId;

                    break;
                }
                default: {
                    throw new Error('Unsuported update type');
                }
            }

            const { hasMore, tokens: next } = await fetchTokens(topId);

            set(hasMoreAtom, hasMore);
            set(loadingAtom, false);
            set(listAtom, (ts) => [...ts, ...next]);
        }
    );

    return derived;
})();

export const topTokensAtom = resetOnUnmountAtom<ContractTokenDetails[]>([]);
export const checkedTokensAtom = resetOnUnmountAtom<string[]>([]);
export const searchAtom = resetOnUnmountAtom<string>('');
export const searchResultAtom = resetOnUnmountAtom<ContractTokenDetails | undefined>(undefined);
export const listScrollPositionAtom = resetOnUnmountAtom<number>(0);
