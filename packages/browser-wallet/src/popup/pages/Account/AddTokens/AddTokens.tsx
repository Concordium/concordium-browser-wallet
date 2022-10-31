import React, { useCallback, useContext, useEffect, useState } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes, useLocation, useNavigate, Location } from 'react-router-dom';
import { isHex, useUpdateEffect } from 'wallet-common-helpers';
import { JsonRpcClient } from '@concordium/web-sdk';
import clsx from 'clsx';
import debounce from 'lodash.debounce';

import Form from '@popup/shared/Form';
import FormInput, { Input } from '@popup/shared/Form/Input';
import Submit from '@popup/shared/Form/Submit';
import { addToastAtom } from '@popup/state';
import { jsonRpcClientAtom, networkConfigurationAtom } from '@popup/store/settings';
import { NetworkConfiguration, TokenIdAndMetadata } from '@shared/storage/types';
import { confirmCIS2Contract, ContractDetails } from '@shared/utils/token-helpers';
import TokenDetails from '@popup/shared/TokenDetails';
import { selectedAccountAtom } from '@popup/store/account';
import { ensureDefined } from '@shared/utils/basic-helpers';
import Button from '@popup/shared/Button';
import TokenBalance from '@popup/shared/TokenBalance';
import { Checkbox } from '@popup/shared/Form/Checkbox';
import { contractBalancesFamily, currentAccountTokensAtom } from '@popup/store/token';
import { absoluteRoutes } from '@popup/constants/routes';
import { accountPageContext } from '../utils';
import {
    checkedTokensAtom,
    contractDetailsAtom,
    contractTokensAtom,
    searchAtom,
    searchResultAtom,
    topTokensAtom,
} from './state';
import { ContractTokenDetails, getTokens } from './utils';

const routes = {
    update: 'update',
    details: 'details',
};

type DetailsLocationState = {
    contractIndex: bigint;
    token: TokenIdAndMetadata;
    balance: bigint;
};

type FormValues = {
    contractIndex: string;
};

/**
 * Component used to choose the contract index for a CIS-2 compliant smart contract instance.
 */
function ChooseContract() {
    const { t } = useTranslation('account', { keyPrefix: 'tokens.add' });
    const [contractDetails, setContractDetails] = useAtom(contractDetailsAtom);
    const addToast = useSetAtom(addToastAtom);
    const form = useForm<FormValues>({
        defaultValues: { contractIndex: contractDetails?.index?.toString() },
    });
    const client = useAtomValue(jsonRpcClientAtom);
    const nav = useNavigate();

    const onSubmit: SubmitHandler<FormValues> = async (vs) => {
        const index = BigInt(vs.contractIndex);
        const instanceInfo = await client.getInstanceInfo({ index, subindex: 0n });
        if (!instanceInfo) {
            return;
        }
        const contractName = instanceInfo.name.substring(5);
        const cd: ContractDetails = { contractName, index, subindex: 0n };
        const error = await confirmCIS2Contract(client, cd);
        if (error) {
            addToast(error);
        } else {
            setContractDetails(cd);
            nav(routes.update);
        }
    };

    return (
        <Form
            className="h-full w-full flex-column p-10 justify-space-between text-center"
            formMethods={form}
            onSubmit={onSubmit}
        >
            {(f) => (
                <>
                    <div>
                        <p className="m-t-0">{t('chooseContractHeader')}</p>
                        <FormInput
                            register={f.register}
                            label={t('contractIndex')}
                            name="contractIndex"
                            rules={{
                                required: t('indexRequired'),
                            }}
                        />
                    </div>
                    <Submit>{t('chooseContract')}</Submit>
                </>
            )}
        </Form>
    );
}

type ContractTokenLineProps = {
    token: ContractTokenDetails;
    onClick(token: ContractTokenDetails): void;
    onToggleChecked(token: ContractTokenDetails): void;
    isChecked: boolean;
};

function ContractTokenLine({ token, onClick, onToggleChecked: toggleChecked, isChecked }: ContractTokenLineProps) {
    const { t } = useTranslation('account', { keyPrefix: 'tokens.add' });

    return (
        <Button key={token.id} clear className="add-tokens-list__token" onClick={() => onClick(token)}>
            <div className="flex align-center h-full">
                <img src={token.metadata.thumbnail?.url} alt={token.metadata.name ?? ''} />
                <div>
                    {token.metadata.name}
                    <div
                        className={clsx(
                            'add-tokens-list__token-balance',
                            token.balance !== 0n && 'add-tokens-list__token-balance--owns'
                        )}
                    >
                        {t('ItemBalancePre')}
                        <TokenBalance
                            balance={token.balance}
                            decimals={token.metadata.decimals ?? 0}
                            symbol={token.metadata.symbol}
                        />
                    </div>
                </div>
            </div>
            <Checkbox
                onClick={(e) => {
                    e.stopPropagation();
                }}
                onChange={() => toggleChecked(token)}
                checked={isChecked}
                className="add-tokens-list__checkbox"
            />
        </Button>
    );
}

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

function UpdateTokens() {
    const { t } = useTranslation('account', { keyPrefix: 'tokens.add' });
    const contractDetails = ensureDefined(useAtomValue(contractDetailsAtom), 'Assumed contract details to be defined');
    const [contractTokens] = useAtom(contractTokensAtom);
    const [topTokens, setTopTokens] = useAtom(topTokensAtom);
    const nav = useNavigate();
    const setAccountTokens = useSetAtom(currentAccountTokensAtom);
    const [checked, setChecked] = useAtom(checkedTokensAtom);
    const [search, setSearch] = useAtom(searchAtom);
    const [searchResult, setSearchResult] = useAtom(searchResultAtom);
    const showToast = useSetAtom(addToastAtom);
    const [searchError, setSearchError] = useState<string | undefined>();
    const lookupTokenId = useLookupTokenId();

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
        const state: DetailsLocationState = {
            token,
            balance,
            contractIndex: contractDetails.index,
        };
        nav(`../${routes.details}`, { state });
    };

    const isTokenChecked = (token: ContractTokenDetails) => checked.includes(token.id);

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

    const storeTokens = async () => {
        const newTokens = allTokens.filter((token) => checked.includes(token.id));
        await setAccountTokens({ contractIndex: contractDetails.index.toString(), newTokens });

        nav(absoluteRoutes.home.account.tokens.path);
    };

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
                {displayTokens.map((token) => (
                    <ContractTokenLine
                        token={token}
                        isChecked={isTokenChecked(token)}
                        onClick={showDetails}
                        onToggleChecked={toggleItem}
                    />
                ))}
            </div>
            <Button className="w-full" onClick={storeTokens}>
                {t('updateTokens')}
            </Button>
        </div>
    );
}

function Details() {
    const { state } = useLocation() as Location & { state?: DetailsLocationState };

    if (state === undefined) {
        return <Navigate to=".." />;
    }

    const { contractIndex, token, balance } = state;

    return <TokenDetails contractIndex={contractIndex.toString()} balance={balance} token={token} />;
}

export default function AddTokens() {
    const { setDetailsExpanded } = useContext(accountPageContext);
    const accountTokens = useAtomValue(currentAccountTokensAtom);
    const contractDetails = useAtomValue(contractDetailsAtom);
    const account = ensureDefined(useAtomValue(selectedAccountAtom), 'Expected account to be selected');
    const currentContractBalances = useAtomValue(
        contractBalancesFamily(account, contractDetails?.index.toString() ?? '')
    );

    // Keep the following in memory while add token flow lives
    const [, updateTokens] = useAtom(contractTokensAtom);
    const [, setChecked] = useAtom(checkedTokensAtom);
    const [, setTopTokens] = useAtom(topTokensAtom);
    useAtom(searchAtom);
    useAtom(searchResultAtom);

    useEffect(() => {
        setDetailsExpanded(false);
        return () => setDetailsExpanded(true);
    }, []);

    useEffect(() => {
        if (contractDetails !== undefined) {
            updateTokens('reset');
        }
    }, [contractDetails?.index]);

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

    return (
        <Routes>
            <Route index element={<ChooseContract />} />
            <Route path={routes.update} element={<UpdateTokens />} />
            <Route path={routes.details} element={<Details />} />
        </Routes>
    );
}
