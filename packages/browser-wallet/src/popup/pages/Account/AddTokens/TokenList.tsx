import React, { CSSProperties, forwardRef, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { isDefined, noOp, useUpdateEffect } from 'wallet-common-helpers';
import { isHex, JsonRpcClient } from '@concordium/web-sdk';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import debounce from 'lodash.debounce';
import InfiniteLoader from 'react-window-infinite-loader';
import AutoSizer from 'react-virtualized-auto-sizer';
import { VariableSizeList as List } from 'react-window';
import { ContractTokenDetails, ContractDetails } from '@shared/utils/token-helpers';
import { absoluteRoutes } from '@popup/constants/routes';
import PendingArrows from '@assets/svg/pending-arrows.svg';
import Button from '@popup/shared/Button';
import { Input } from '@popup/shared/Form/Input';
import { addToastAtom } from '@popup/state';
import { selectedAccountAtom } from '@popup/store/account';
import { jsonRpcClientAtom, networkConfigurationAtom } from '@popup/store/settings';
import { currentAccountTokensAtom } from '@popup/store/token';
import { NetworkConfiguration } from '@shared/storage/types';
import { ensureDefined } from '@shared/utils/basic-helpers';
import ContractTokenLine, { ChoiceStatus } from '@popup/shared/ContractTokenLine';
import { AsyncWrapper } from '@popup/store/utils';
import {
    checkedTokensAtom,
    contractDetailsAtom,
    contractTokensAtom,
    listScrollPositionAtom,
    searchAtom,
    searchResultAtom,
    topTokensAtom,
} from './state';
import { DetailsLocationState, getTokens, addTokensRoutes } from './utils';
import { tokensRoutes } from '../Tokens/routes';

const ELEMENT_HEIGHT = 58;

type InfiniteTokenListProps = {
    tokens: ContractTokenDetails[];
    hasNextPage: boolean;
    loadNextPage(): void;
    isNextPageLoading: boolean;
    initialScrollOffset: number;
    children(token: ContractTokenDetails, style: CSSProperties): ReactNode;
};

const InfiniteTokenList = forwardRef<HTMLDivElement, InfiniteTokenListProps>(
    ({ tokens, hasNextPage, loadNextPage, isNextPageLoading, children, initialScrollOffset }, outerRef) => {
        const itemCount = hasNextPage ? tokens.length + 1 : tokens.length;
        const loadMoreItems = isNextPageLoading ? noOp : loadNextPage;
        const isItemLoaded = (index: number) => !hasNextPage || index < tokens.length;

        return (
            <AutoSizer>
                {({ height, width }) => (
                    <InfiniteLoader isItemLoaded={isItemLoaded} itemCount={itemCount} loadMoreItems={loadMoreItems}>
                        {({ onItemsRendered, ref }) => (
                            <List
                                className="add-tokens-list__infinite"
                                itemCount={tokens.length}
                                onItemsRendered={onItemsRendered}
                                ref={ref}
                                width={width}
                                height={height}
                                itemSize={() => ELEMENT_HEIGHT}
                                itemKey={(i) => tokens[i]?.id}
                                outerRef={outerRef}
                                initialScrollOffset={initialScrollOffset}
                            >
                                {({ index, style }) => {
                                    if (!isItemLoaded(index)) {
                                        return <div style={style}>Loading</div>;
                                    }

                                    return <>{children(tokens[index], style)}</>;
                                }}
                            </List>
                        )}
                    </InfiniteLoader>
                )}
            </AutoSizer>
        );
    }
);

/**
 * Debounced token ID lookup function.
 * Sets result.value to empty list on error, list with 1 token on successful lookup, and undefined while loading.
 * Invoking with empty searchQuery param aborts previous invocations.
 */
const lookupTokenIdConfigure = (
    contractDetails: ContractDetails,
    client: JsonRpcClient,
    network: NetworkConfiguration,
    account: string
) => {
    let ac: AbortController;

    return debounce(
        async (searchQuery: string, setResult: (ctd: AsyncWrapper<ContractTokenDetails[] | undefined>) => void) => {
            ac?.abort();
            ac = new AbortController();
            const { signal } = ac;

            let value: ContractTokenDetails[] | undefined;

            if (!searchQuery) {
                return;
            }

            setResult({ loading: true, value: undefined });

            try {
                const [token] = await getTokens(contractDetails, client, network, account, [searchQuery]);

                value = [token as ContractTokenDetails];
            } catch {
                value = [];
            }

            if (!signal.aborted) {
                setResult({ loading: false, value });
            }
        },
        500,
        { leading: true }
    );
};

const validateId = (id: string | undefined, message: string) => {
    if (!id || isHex(id)) {
        return undefined;
    }
    return message;
};

function useLookupTokenId() {
    const contractDetails = ensureDefined(useAtomValue(contractDetailsAtom), 'Assumed contract details to be defined');
    const client = useAtomValue(jsonRpcClientAtom);
    const network = useAtomValue(networkConfigurationAtom);
    const account = ensureDefined(useAtomValue(selectedAccountAtom), 'No account selected');

    const lookupTokenId = useCallback(lookupTokenIdConfigure(contractDetails, client, network, account), [
        client,
        contractDetails,
        account,
    ]);

    return lookupTokenId;
}

export default function TokenList() {
    const { t } = useTranslation('account', { keyPrefix: 'tokens.add' });
    const contractDetails = ensureDefined(useAtomValue(contractDetailsAtom), 'Assumed contract details to be defined');
    const [{ hasMore, loading, tokens: contractTokens }, updateTokens] = useAtom(contractTokensAtom);
    const [topTokens, setTopTokens] = useAtom(topTokensAtom);
    const nav = useNavigate();
    const [accountTokens, setAccountTokens] = useAtom(currentAccountTokensAtom);
    const [checked, setChecked] = useAtom(checkedTokensAtom);
    const [search, setSearch] = useAtom(searchAtom);
    const [searchResult, setSearchResult] = useAtom(searchResultAtom);
    const [searchError, setSearchError] = useState<string | undefined>();
    const lookupTokenId = useLookupTokenId();
    const listRef = useRef<HTMLDivElement>(null);
    const [listScroll, setListScroll] = useAtom(listScrollPositionAtom);
    const addToast = useSetAtom(addToastAtom);

    const allTokens = [...topTokens, ...contractTokens.filter((ct) => !topTokens.some((tt) => tt.id === ct.id))];
    const displayTokens = searchResult.value !== undefined ? searchResult.value : allTokens;
    const filteredDisplayTokens = displayTokens.filter((td) => isDefined(td.metadata));

    useUpdateEffect(() => {
        if (!search) {
            setSearchResult({ loading: false, value: undefined });
        }

        lookupTokenId(search, setSearchResult);
    }, [search]);

    useEffect(() => {
        setSearchError(validateId(search, t('hexId')));
    }, [search]);

    const showDetails = ({ balance, ...token }: ContractTokenDetails) => {
        setListScroll(listRef.current?.scrollTop ?? 0);

        const state: DetailsLocationState = {
            token,
            balance,
            contractIndex: contractDetails.index,
        };
        nav(`../${addTokensRoutes.details}`, { state });
    };

    const isTokenChecked = (token: ContractTokenDetails) =>
        checked.includes(token.id) ? ChoiceStatus.chosen : ChoiceStatus.discarded;

    const toggleItem = useCallback(
        (token: ContractTokenDetails) => {
            if (isTokenChecked(token)) {
                setChecked((cs) => cs.filter((c) => c !== token.id));
                return;
            }

            setChecked((cs) => [...cs, token.id]);
            if (searchResult.value !== undefined) {
                setTopTokens((tts) => [...tts, ...(searchResult.value ?? [])]);
            }
        },
        [searchResult.value, checked, setChecked]
    );

    const hasListChanged = useCallback(
        (tokens: ContractTokenDetails[]) => {
            const currentTokens = accountTokens.value[contractDetails.index.toString()]?.map((at) => at.id) ?? [];

            return currentTokens.length !== tokens.length || !tokens.every((token) => currentTokens.includes(token.id));
        },
        [accountTokens, contractDetails.index]
    );

    const storeTokens = async () => {
        const newTokens = allTokens.filter((token) => checked.includes(token.id));
        await setAccountTokens({ contractIndex: contractDetails.index.toString(), newTokens });

        const changed = hasListChanged(newTokens);
        const toastText = changed ? t('tokensChanged') : t('noTokensChange');

        addToast(toastText);

        if (!changed || newTokens.length === 0) {
            nav(-1);
            return;
        }

        // Try to show the user the page corresponding to the type of token chosen.
        if (newTokens.every((nt) => nt.metadata.unique)) {
            // Only collectibles.
            nav(`${absoluteRoutes.home.account.tokens.path}/${tokensRoutes.collectibles}`);
        } else if (newTokens.every((nt) => !nt.metadata.unique)) {
            // Only fungibles
            nav(absoluteRoutes.home.account.tokens.path);
        } else {
            nav(-1);
        }
    };

    const hasNextPage = searchResult.value === undefined && hasMore;
    const listLoading = searchResult.loading;
    const emptyList = !listLoading && displayTokens.length === 0 && filteredDisplayTokens.length === 0;
    const missingMetadata = displayTokens.length !== filteredDisplayTokens.length;

    return (
        <div className="add-tokens-list">
            <Input
                className="w-full m-b-10"
                type="search"
                label={t('searchLabel', { contractName: contractDetails.contractName })}
                onChange={(e) => setSearch(e.target.value)}
                error={searchError}
            />
            <div className="add-tokens-list__tokens">
                {listLoading && <PendingArrows className="loading add-tokens-list__loading loading--delay" />}
                {(emptyList || missingMetadata) && (
                    <p className="w-full text-center p-h-20">
                        {emptyList && t('emptyList')}
                        {missingMetadata && t('missingMetadata')}
                    </p>
                )}
                {!emptyList && !missingMetadata && !listLoading && (
                    <InfiniteTokenList
                        tokens={filteredDisplayTokens}
                        loadNextPage={() => updateTokens({ type: 'next' })}
                        hasNextPage={hasNextPage}
                        isNextPageLoading={loading}
                        ref={listRef}
                        initialScrollOffset={listScroll}
                    >
                        {(token, style) => (
                            <ContractTokenLine
                                token={token}
                                status={isTokenChecked(token)}
                                onClick={showDetails}
                                onToggleChecked={toggleItem}
                                style={style}
                            />
                        )}
                    </InfiniteTokenList>
                )}
            </div>
            <Button className="w-full" onClick={storeTokens}>
                {t('updateTokens')}
            </Button>
        </div>
    );
}
