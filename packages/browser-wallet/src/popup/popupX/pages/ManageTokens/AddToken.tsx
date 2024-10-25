import React, { useCallback, useEffect, useRef } from 'react';
import Page from '@popup/popupX/shared/Page';
import { useTranslation } from 'react-i18next';
import Text from '@popup/popupX/shared/Text';
import FormSearch from '@popup/popupX/shared/Form/Search';
import { useForm } from '@popup/popupX/shared/Form';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { grpcClientAtom } from '@popup/store/settings';
import { confirmCIS2Contract, ContractDetails } from '@shared/utils/token-helpers';
import { fetchTokensConfigure, FetchTokensResponse } from '@popup/pages/Account/Tokens/ManageTokens/utils';
import { selectedAccountAtom } from '@popup/store/account';
import { contractDetailsAtom, contractTokensAtom } from '@popup/pages/Account/Tokens/ManageTokens/state';
import { SubmitHandler } from 'react-hook-form';
import { debouncedAsyncValidate } from '@popup/shared/utils/validation-helpers';
import { ContractAddress } from '@concordium/web-sdk';
import { logWarningMessage } from '@shared/utils/log-helpers';
import Form from '@popup/popupX/shared/Form/Form';
import TokenList from '@popup/popupX/shared/TokenList';

const VALIDATE_INDEX_DELAY_MS = 500;

type FormValues = {
    contractIndex: string;
};

// ToDo page UI need full rework
function AddToken({ account }: { account: string }) {
    const { t } = useTranslation('x', { keyPrefix: 'mangeTokens' });
    const form = useForm<FormValues>({
        defaultValues: { contractIndex: '' },
    });
    const contractIndexValue = form.watch('contractIndex');
    const client = useAtomValue(grpcClientAtom);
    const validContract = useRef<{ details: ContractDetails; tokens: FetchTokensResponse } | undefined>();

    const setContractDetails = useSetAtom(contractDetailsAtom);
    const [, updateTokens] = useAtom(contractTokensAtom);
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

                let instanceInfo;
                try {
                    instanceInfo = await client.getInstanceInfo(ContractAddress.create(index));
                } catch {
                    return t('noContractFound');
                }

                const contractName = instanceInfo.name.value.substring(5);
                const cd: ContractDetails = { contractName, index, subindex: 0n };
                const error = await confirmCIS2Contract(client, cd);

                if (error !== undefined) {
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
                    return t('noTokensError');
                }

                validContract.current = { details: cd, tokens: response };
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

    return (
        <Page className="add-token-x">
            <Page.Top heading={t('addToken')} />
            <Page.Main>
                <Text.MainRegular>{t('enterContract')}</Text.MainRegular>
                <Form formMethods={form} onSubmit={onSubmit}>
                    {(f) => (
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
                    )}
                </Form>
                <TokenList>
                    {validContract.current?.tokens.tokens.map((token) => (
                        <TokenList.Item
                            key={token.metadata?.description}
                            thumbnail={token.metadata?.display?.url}
                            symbol={token.metadata?.description}
                        />
                    ))}
                </TokenList>
            </Page.Main>
        </Page>
    );
}

export default function AddTokenRoot() {
    const account = useAtomValue(selectedAccountAtom);
    if (!account) return null;

    return <AddToken account={account} />;
}
