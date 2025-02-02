import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import FormSearch from '@popup/popupX/shared/Form/Search';
import { useForm } from '@popup/popupX/shared/Form';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { grpcClientAtom } from '@popup/store/settings';
import { confirmCIS2Contract, ContractDetails, ContractTokenDetails } from '@shared/utils/token-helpers';
import { fetchTokensConfigure, FetchTokensResponse } from '@popup/pages/Account/Tokens/ManageTokens/utils';
import { selectedAccountAtom } from '@popup/store/account';
import { contractDetailsAtom, contractTokensAtom } from '@popup/pages/Account/Tokens/ManageTokens/state';
import { SubmitHandler } from 'react-hook-form';
import { debouncedAsyncValidate } from '@popup/shared/utils/validation-helpers';
import { ContractAddress } from '@concordium/web-sdk';
import { logWarningMessage } from '@shared/utils/log-helpers';
import Form from '@popup/popupX/shared/Form/Form';
import TokenList from '@popup/popupX/shared/TokenList';
import { LoaderInline } from '@popup/popupX/shared/Loader';
import Button from '@popup/popupX/shared/Button';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import { currentAccountTokensAtom } from '@popup/store/token';
import { TokenIdAndMetadata } from '@shared/storage/types';
import { useGenericToast } from '@popup/popupX/shared/utils/hooks';
import { ChoiceStatus } from '@popup/shared/ContractTokenLine';
import { SearchTokenDetails } from '@popup/popupX/pages/ManageTokens';

type LoadedTokens = ContractTokenDetails & { status: ChoiceStatus };

type TokenRowProps = {
    token: LoadedTokens;
    id: string;
    contractAddress: ContractAddress.Serializable;
    updateTokenStatus(checked: boolean, id: string): void;
};

function TokenRow({ token, id, contractAddress, updateTokenStatus }: TokenRowProps) {
    const [detailsIsOpen, setDetailsIsOpen] = useState(false);
    const { status } = token;

    return (
        <>
            <SearchTokenDetails
                token={token}
                contractAddress={contractAddress}
                detailsIsOpen={detailsIsOpen}
                setDetailsIsOpen={setDetailsIsOpen}
            />
            <TokenList.Item
                thumbnail={token.metadata?.display?.url}
                symbol={token.metadata?.name}
                checked={status === ChoiceStatus.chosen || status === ChoiceStatus.existing}
                onClick={() => {
                    setDetailsIsOpen(true);
                }}
                onChange={(e) => {
                    updateTokenStatus(e.target.checked, id);
                }}
            />
        </>
    );
}

const VALIDATE_INDEX_DELAY_MS = 500;

type FormValues = {
    contractIndex: string;
    tokenId: string;
};

function AddToken({ account }: { account: string }) {
    const { t } = useTranslation('x', { keyPrefix: 'mangeTokens' });
    const nav = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [loadedTokens, setLoadedTokens] = useState<LoadedTokens[]>([]);
    const [filteredTokens, setFilteredTokens] = useState<LoadedTokens[]>([]);
    const toast = useGenericToast();
    const form = useForm<FormValues>({
        defaultValues: { contractIndex: '', tokenId: '' },
    });
    const contractIndexValue = form.watch('contractIndex');
    const tokenIdValue = form.watch('tokenId');
    const client = useAtomValue(grpcClientAtom);
    const validContract = useRef<{ details: ContractDetails; tokens: FetchTokensResponse } | undefined>();

    const setContractDetails = useSetAtom(contractDetailsAtom);
    const [{ hasMore, loading, tokens: contractTokens }, updateTokens] = useAtom(contractTokensAtom);
    const [accountTokens, setAccountTokens] = useAtom(currentAccountTokensAtom);
    const onSubmit: SubmitHandler<FormValues> = async () => {
        if (validContract.current === undefined) {
            throw new Error('Expected contract details');
        }

        setContractDetails(validContract.current.details);
        await updateTokens({ type: 'reset', initialTokens: validContract.current.tokens });
    };

    const validateIndex = useCallback(
        debouncedAsyncValidate<string>(
            async (value) => {
                validContract.current = undefined;

                let index;
                try {
                    index = BigInt(value);
                } catch {
                    return t('invalidIndex');
                }

                if (index < 0n) {
                    return t('negativeIndex');
                }

                if (index >= 2n ** 64n) {
                    return t('indexMax');
                }

                setIsLoading(true);
                let instanceInfo;
                try {
                    instanceInfo = await client.getInstanceInfo(ContractAddress.create(index));
                } catch {
                    setIsLoading(false);
                    return t('noContractFound');
                }

                const contractName = instanceInfo.name.value.substring(5);
                const cd: ContractDetails = { contractName, index, subindex: 0n };
                const error = await confirmCIS2Contract(client, cd);

                if (error !== undefined) {
                    setIsLoading(false);
                    return error;
                }

                const fetchErrors: string[] = [];

                const response = await fetchTokensConfigure(cd, client, account, (e) => {
                    fetchErrors.push(e);
                })();

                if (fetchErrors.length > 0) {
                    logWarningMessage(
                        `Tokens in contract ${cd.index.toString()}:${cd.subindex.toString()} failed: \n${fetchErrors.join(
                            '\n'
                        )}`
                    );
                }

                if (response.tokens.length === 0) {
                    setIsLoading(false);
                    return t('noTokensError');
                }
                validContract.current = { details: cd, tokens: response };

                setContractDetails(validContract.current.details);
                await updateTokens({ type: 'reset', initialTokens: validContract.current.tokens });

                setIsLoading(false);
                return true;
            },
            VALIDATE_INDEX_DELAY_MS,
            true
        ),
        [client]
    );

    useEffect(() => {
        validContract.current = undefined;
    }, [contractIndexValue]);

    useEffect(() => {
        const tokensWithStatus =
            contractTokens.map((token) => ({
                ...token,
                status: accountTokens.value[contractIndexValue]?.map(({ id }) => id).includes(token.id)
                    ? ChoiceStatus.existing
                    : ChoiceStatus.discarded,
            })) || [];
        setLoadedTokens(tokensWithStatus);
    }, [loading, contractTokens.length]);

    useEffect(() => {
        setFilteredTokens([
            ...loadedTokens.filter(
                ({ id, metadata }) => id.includes(tokenIdValue) || (metadata?.name || '').includes(tokenIdValue)
            ),
        ]);
    }, [tokenIdValue, loadedTokens]);

    const updateTokenStatus = (checked: boolean, id: string) => {
        setLoadedTokens([
            ...loadedTokens.map((token) => {
                if (token.id === id) {
                    return { ...token, status: checked ? ChoiceStatus.chosen : ChoiceStatus.discarded };
                }
                return token;
            }),
        ]);
    };

    const setTokens = () => {
        const initialTokens = accountTokens.value[contractIndexValue] || [];

        const newTokens = loadedTokens
            .reduce((acc, token) => {
                if (token.status === ChoiceStatus.discarded) {
                    return acc.filter(({ id }) => id !== token.id);
                }

                if (token.status === ChoiceStatus.chosen || !acc.find(({ id }) => id === token.id)) {
                    return [...acc, token as TokenIdAndMetadata];
                }

                return acc;
            }, initialTokens)
            .map(({ id, metadata, metadataLink }) => ({ id, metadata, metadataLink }));

        setAccountTokens({ contractIndex: contractIndexValue, newTokens });
        toast('Token list updated');
        nav(absoluteRoutes.home.manageTokenList.path);
    };

    const haveTokens = contractTokens.length || 0;
    return (
        <Page className="add-token-x">
            <Page.Top heading={t('addToken')} />
            <Page.Main>
                <Text.MainRegular>{t('enterContract')}</Text.MainRegular>
                <Form formMethods={form} onSubmit={onSubmit}>
                    {(f) => (
                        <>
                            <FormSearch
                                autoFocus
                                control={f.control}
                                label={t('contractIndex')}
                                name="contractIndex"
                                rules={{
                                    required: t('indexRequired'),
                                    validate: validateIndex,
                                }}
                            />
                            {haveTokens > 4 && <FormSearch control={f.control} label={t('tokenName')} name="tokenId" />}
                        </>
                    )}
                </Form>
                <TokenList>
                    {filteredTokens.map((token) => (
                        <TokenRow
                            key={token.id}
                            token={token}
                            id={token.id}
                            contractAddress={{ index: contractIndexValue, subindex: '0' }}
                            updateTokenStatus={updateTokenStatus}
                        />
                    ))}
                    {(loading || (isLoading && !haveTokens)) && <LoaderInline />}
                    {!!haveTokens && hasMore && (
                        <Button.Main
                            className="secondary"
                            label={t('loadMore')}
                            onClick={() => {
                                updateTokens({ type: 'next' });
                            }}
                        />
                    )}
                </TokenList>
            </Page.Main>
            <Page.Footer>{!!haveTokens && <Button.Main label={t('addSelected')} onClick={setTokens} />}</Page.Footer>
        </Page>
    );
}

export default function AddTokenRoot() {
    const account = useAtomValue(selectedAccountAtom);
    if (!account) return null;

    return <AddToken account={account} />;
}
