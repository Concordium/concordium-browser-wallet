import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import FormSearch from '@popup/popupX/shared/Form/Search';
import { useForm } from '@popup/popupX/shared/Form';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { grpcClientAtom } from '@popup/store/settings';
import {
    ChoiceStatus,
    confirmCIS2Contract,
    ContractDetails,
    ContractTokenDetails,
    mapPltToLoadedToken,
} from '@shared/utils/token-helpers';
import {
    fetchTokensConfigure,
    FetchTokensResponse,
    TokenWithPageID,
} from '@popup/pages/Account/Tokens/ManageTokens/utils';
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
import { currentAccountTokensAtom, hidePltInRemove } from '@popup/store/token';
import { PLT } from '@shared/constants/token';
import { TokenIdAndMetadata } from '@shared/storage/types';
import { useGenericToast } from '@popup/popupX/shared/utils/hooks';
import { SearchTokenDetails } from '@popup/popupX/pages/ManageTokens';
import { getPltToken } from '@popup/shared/utils/wallet-proxy';
import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';

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
                error={token.error}
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
    nameOrIndex: string;
    tokenId: string;
};

// ToDo need full rework PLT not compatible with CIS2 in app, metadataLink important
function AddToken({ account }: { account: string }) {
    const { t } = useTranslation('x', { keyPrefix: 'mangeTokens' });
    const nav = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [loadedTokens, setLoadedTokens] = useState<LoadedTokens[]>([]);
    const [filteredTokens, setFilteredTokens] = useState<LoadedTokens[]>([]);
    const toast = useGenericToast();
    const form = useForm<FormValues>({
        defaultValues: { nameOrIndex: '', tokenId: '' },
    });
    const nameOrIndexValue = form.watch('nameOrIndex');
    const tokenIdValue = form.watch('tokenId');
    const client = useAtomValue(grpcClientAtom);
    const validContract = useRef<{ details: ContractDetails; tokens: FetchTokensResponse } | undefined>();

    const setContractDetails = useSetAtom(contractDetailsAtom);
    const [{ hasMore, loading, tokens: contractTokens }, updateTokens] = useAtom(contractTokensAtom);
    const [accountTokens, setAccountTokens] = useAtom(currentAccountTokensAtom);
    const selectedAccount = useSelectedAccountInfo();
    const onSubmit: SubmitHandler<FormValues> = async () => {
        if (Number(nameOrIndexValue) >= 0) {
            if (validContract.current === undefined) {
                throw new Error('Expected contract details');
            }

            setContractDetails(validContract.current.details);
            await updateTokens({ type: 'reset', initialTokens: validContract.current.tokens });
        } else {
            const pltData = await getPltToken(nameOrIndexValue);
            if (pltData && selectedAccount) {
                const pltMapped = await mapPltToLoadedToken(pltData, selectedAccount, accountTokens);
                setLoadedTokens([pltMapped]);
            }
        }
    };

    const validateCis2 = async (value: string) => {
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
    };

    const validatePlt = async (value: string) => {
        let pltData;
        try {
            setIsLoading(true);
            pltData = await getPltToken(value);
        } catch {
            setIsLoading(false);
            return t('noTokensError');
        }

        if (!pltData || !selectedAccount) {
            setIsLoading(false);
            return t('noTokensError');
        }

        const mapped = await mapPltToLoadedToken(pltData, selectedAccount, accountTokens);
        const response = [{ ...mapped, pageId: 1 }] as TokenWithPageID[];

        const cd: ContractDetails = { contractName: PLT, index: 0n, subindex: 0n };
        validContract.current = { details: cd, tokens: { hasMore: false, tokens: response } };

        setContractDetails(validContract.current.details);
        await updateTokens({ type: 'reset', initialTokens: validContract.current.tokens });

        setIsLoading(false);
        return true;
    };

    const validateIndex = useCallback(
        debouncedAsyncValidate<string>(
            async (value) => {
                let result;
                if (Number(value) >= 0) {
                    result = await validateCis2(value);
                } else {
                    result = await validatePlt(value);
                }

                if (result !== true) {
                    setContractDetails();
                    await updateTokens({ type: 'reset', initialTokens: { hasMore: false, tokens: [] } });
                }

                return result;
            },
            VALIDATE_INDEX_DELAY_MS,
            true
        ),
        [client]
    );

    useEffect(() => {
        validContract.current = undefined;
    }, [nameOrIndexValue]);

    useEffect(() => {
        const tokenContractKey = Number(nameOrIndexValue) >= 0 ? nameOrIndexValue : PLT;
        const tokensWithStatus =
            contractTokens.map((token) => {
                const accountToken = accountTokens.value[tokenContractKey]?.find(({ id }) => id === token.id);
                return {
                    ...token,
                    status:
                        accountToken && !accountToken.metadata.isHidden
                            ? ChoiceStatus.existing
                            : ChoiceStatus.discarded,
                };
            }) || [];
        setLoadedTokens(tokensWithStatus);
    }, [isLoading, contractTokens.length]);

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

    const updateAddDate = (token: LoadedTokens) =>
        ({
            ...token,
            metadata: { ...token.metadata, addedAt: Date.now() },
        } as TokenIdAndMetadata);

    const setTokens = () => {
        const tokenContractKey = Number(nameOrIndexValue) >= 0 ? nameOrIndexValue : PLT;
        const initialTokens = accountTokens.value[tokenContractKey] || [];

        const newTokens = loadedTokens
            .reduce((acc, token) => {
                if (token.status === ChoiceStatus.discarded) {
                    if (tokenContractKey === PLT) {
                        return hidePltInRemove(acc, token.id);
                    }
                    return acc.filter(({ id }) => id !== token.id);
                }

                if (token.status === ChoiceStatus.chosen && !acc.find(({ id }) => id === token.id)) {
                    return [...acc, updateAddDate(token)];
                }

                if (token.status === ChoiceStatus.chosen && acc.find(({ id }) => id === token.id)?.metadata?.isHidden) {
                    return [...acc.filter(({ id }) => id !== token.id), updateAddDate(token)];
                }

                return acc;
            }, initialTokens)
            .map(({ id, metadata, metadataLink }) => ({ id, metadata, metadataLink }));

        setAccountTokens({ contractIndex: tokenContractKey, newTokens });
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
                                label={t('nameOrIndex')}
                                name="nameOrIndex"
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
                            contractAddress={{ index: nameOrIndexValue, subindex: '0' }}
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
            <Page.Footer>
                {!!loadedTokens.length && <Button.Main label={t('addSelected')} onClick={setTokens} />}
            </Page.Footer>
        </Page>
    );
}

export default function AddTokenRoot() {
    const account = useAtomValue(selectedAccountAtom);
    if (!account) return null;

    return <AddToken account={account} />;
}
