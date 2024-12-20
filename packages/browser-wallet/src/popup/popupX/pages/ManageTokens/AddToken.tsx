import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import FormSearch from '@popup/popupX/shared/Form/Search';
import { useForm } from '@popup/popupX/shared/Form';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { grpcClientAtom } from '@popup/store/settings';
import { confirmCIS2Contract, ContractDetails } from '@shared/utils/token-helpers';
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
import { currentAccountTokensAtom } from '@popup/store/token';
import { TokenIdAndMetadata } from '@shared/storage/types';
import { useGenericToast } from '@popup/popupX/shared/utils/hooks';

const VALIDATE_INDEX_DELAY_MS = 500;

type FormValues = {
    contractIndex: string;
    tokenId: string;
};

// ToDo update token infinity-load, check, add
function AddToken({ account }: { account: string }) {
    const { t } = useTranslation('x', { keyPrefix: 'mangeTokens' });
    const params = useParams();
    const nav = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [checkedTokens, setCheckedTokens] = useState<TokenWithPageID[]>([]);
    const [filteredTokens, setFilteredTokens] = useState<TokenWithPageID[]>([]);
    const toast = useGenericToast();
    const form = useForm<FormValues>({
        defaultValues: { contractIndex: params.contractIndex || '' },
    });
    const contractIndexValue = form.watch('contractIndex');
    const tokenIdValue = form.watch('tokenId');
    const client = useAtomValue(grpcClientAtom);
    const validContract = useRef<{ details: ContractDetails; tokens: FetchTokensResponse } | undefined>();

    const setContractDetails = useSetAtom(contractDetailsAtom);
    const [, updateTokens] = useAtom(contractTokensAtom);
    const [, setAccountTokens] = useAtom(currentAccountTokensAtom);
    const onSubmit: SubmitHandler<FormValues> = async () => {
        if (validContract.current === undefined) {
            throw new Error('Expected contract details');
        }

        setContractDetails(validContract.current.details);
        updateTokens({ type: 'reset', initialTokens: validContract.current.tokens });
    };

    const validateIndex = useCallback(
        debouncedAsyncValidate<string>(
            async (value) => {
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
                setFilteredTokens(response.tokens);
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
        setFilteredTokens([
            ...(validContract.current?.tokens.tokens || []).filter(
                ({ id, metadata }) => id.includes(tokenIdValue) || (metadata?.name || '').includes(tokenIdValue)
            ),
        ]);
    }, [tokenIdValue]);

    const navToTokenDetails = (token: TokenWithPageID, contractIndex: string) =>
        nav(
            absoluteRoutes.home.manageTokenList.addToken.contractIndex.details.path.replace(
                ':contractIndex',
                contractIndex
            ),
            { state: { token } }
        );

    const checkToken = (checked: boolean, token: TokenWithPageID) => {
        if (checked) {
            setCheckedTokens([...checkedTokens, token]);
        } else {
            setCheckedTokens(checkedTokens.filter((c) => c.id !== token.id));
        }
    };

    const setTokens = () => {
        setAccountTokens({ contractIndex: contractIndexValue, newTokens: checkedTokens as TokenIdAndMetadata[] });
        toast('Token list updated', `Update count ${checkedTokens.length}`);
        nav(absoluteRoutes.home.manageTokenList.path);
    };

    const haveTokens = validContract.current?.tokens.tokens.length || 0;

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
                {isLoading && !haveTokens && <LoaderInline />}
                <TokenList>
                    {filteredTokens.map((token) => (
                        <TokenList.Item
                            key={token.id}
                            thumbnail={token.metadata?.display?.url}
                            symbol={token.metadata?.name}
                            onClick={() => navToTokenDetails(token, contractIndexValue)}
                            onSelect={(checked: boolean) => {
                                checkToken(checked, token);
                            }}
                        />
                    ))}
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
