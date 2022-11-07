import React, { CSSProperties, forwardRef, ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { noOp, useUpdateEffect } from 'wallet-common-helpers';
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
import {
    checkedTokensAtom,
    contractDetailsAtom,
    contractTokensAtom,
    listScrollPositionAtom,
    searchAtom,
    searchResultAtom,
    topTokensAtom,
} from './state';
import { DetailsLocationState, getTokens, routes } from './utils';

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

const lookupTokenIdConfigure = (
    contractDetails: ContractDetails,
    client: JsonRpcClient,
    network: NetworkConfiguration,
    account: string
) =>
    debounce(
        async (q: string, setResult: (ctd: ContractTokenDetails | undefined) => void, onNoValidToken: () => void) => {
            try {
                const [token] = await getTokens(contractDetails, client, network, account, [q]);

                if (token?.metadata !== undefined) {
                    setResult(token as ContractTokenDetails);
                } else {
                    throw new Error('No valid token found');
                }
            } catch {
                onNoValidToken();
                setResult(undefined);
            }
        },
        500
    );

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
    const showToast = useSetAtom(addToastAtom);
    const [searchError, setSearchError] = useState<string | undefined>();
    const lookupTokenId = useLookupTokenId();
    const listRef = useRef<HTMLDivElement>(null);
    const [listScroll, setListScroll] = useAtom(listScrollPositionAtom);
    const addToast = useSetAtom(addToastAtom);

    const allTokens = [...topTokens, ...contractTokens.filter((ct) => !topTokens.some((tt) => tt.id === ct.id))];
    const displayTokens = searchResult !== undefined ? [searchResult] : allTokens;

    useUpdateEffect(() => {
        if (search) {
            lookupTokenId(search, setSearchResult, () => showToast(t('noValidTokenError')));
        } else {
            setSearchResult(undefined);
        }
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
        nav(`../${routes.details}`, { state });
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

            if (searchResult !== undefined) {
                setTopTokens((tts) => [...tts, searchResult]);
            }
        },
        [searchResult, checked, setChecked]
    );

    const hasChanged = useCallback(
        (tokens: ContractTokenDetails[]) => {
            const currentTokens = accountTokens.value[contractDetails.index.toString()]?.map((at) => at.id) ?? [];

            return currentTokens.length !== tokens.length || !tokens.every((token) => currentTokens.includes(token.id));
        },
        [accountTokens, contractDetails.index]
    );

    const storeTokens = async () => {
        const newTokens = allTokens.filter((token) => checked.includes(token.id));
        await setAccountTokens({ contractIndex: contractDetails.index.toString(), newTokens });

        const toastText = hasChanged(newTokens) ? t('tokensChanged') : t('noTokensChange');

        addToast(toastText);
        nav(absoluteRoutes.home.account.tokens.path);
    };

    const hasNextPage = searchResult === undefined && hasMore;
    const initialLoading = contractTokens.length === 0 && loading;

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
                {initialLoading && <PendingArrows className="loading add-tokens-list__loading" />}
                {initialLoading || (
                    <InfiniteTokenList
                        tokens={displayTokens}
                        loadNextPage={() => updateTokens('next')}
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
