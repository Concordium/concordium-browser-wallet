import React, { useContext, useEffect, useMemo } from 'react';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes, useLocation, useNavigate, Location } from 'react-router-dom';
import { isDefined, MakeOptional } from 'wallet-common-helpers';
import { JsonRpcClient } from '@concordium/web-sdk';
import clsx from 'clsx';
import Form from '@popup/shared/Form';
import FormInput from '@popup/shared/Form/Input';
import Submit from '@popup/shared/Form/Submit';
import { addToastAtom } from '@popup/state';
import { jsonRpcClientAtom, networkConfigurationAtom } from '@popup/store/settings';
import { NetworkConfiguration, TokenIdAndMetadata, TokenMetadata } from '@shared/storage/types';
import {
    confirmCIS2Contract,
    ContractDetails,
    getContractBalances,
    getTokenMetadata,
    getTokenUrl,
} from '@shared/utils/token-helpers';
import TokenDetails from '@popup/shared/TokenDetails';
import { getCis2Tokens } from '@popup/shared/utils/wallet-proxy';
import { selectedAccountAtom } from '@popup/store/account';
import { ensureDefined } from '@shared/utils/basic-helpers';
import Button from '@popup/shared/Button';
import TokenBalance from '@popup/shared/TokenBalance';
import { Checkbox } from '@popup/shared/Form/Checkbox';
import { contractBalancesFamily, currentAccountTokensAtom } from '@popup/store/token';
import { absoluteRoutes } from '@popup/constants/routes';
import { accountPageContext } from '../utils';

type TokensAtomAction = 'reset' | 'next';
type ContractTokenDetails = TokenIdAndMetadata & {
    balance: bigint;
};

const TOKENS_PAGE_SIZE = 20;

type TokenWithPageID = MakeOptional<ContractTokenDetails, 'metadata'> & {
    pageId: number;
};

const fallbackMetadata = (id: string): TokenMetadata => ({
    thumbnail: { url: 'https://picsum.photos/40/40' },
    display: { url: 'https://picsum.photos/200/300' },
    name: id.substring(0, 8),
    decimals: 0,
    description: id,
    unique: true,
});

const fetchTokensConfigure =
    (contractDetails: ContractDetails, client: JsonRpcClient, network: NetworkConfiguration, account: string) =>
    async (from?: number): Promise<TokenWithPageID[]> => {
        const ts =
            (await getCis2Tokens(contractDetails.index, contractDetails.subindex, from, TOKENS_PAGE_SIZE))?.tokens ??
            [];
        const ids = ts.map((t) => t.token);

        const metadataPromise: Promise<[string[], Array<TokenMetadata | undefined>]> = (async () => {
            const metadataUrls = await getTokenUrl(client, ids, contractDetails);
            const metadata = await Promise.all(
                metadataUrls.map((url, i) => {
                    const fallback = fallbackMetadata(ids[i]); // TODO change to undefined, only here for testing purposes.
                    return getTokenMetadata(url, network).catch(() => Promise.resolve(fallback));
                })
            );
            return [metadataUrls, metadata];
        })();

        const balancesPromise = getContractBalances(
            client,
            contractDetails.index,
            contractDetails.subindex,
            ids,
            account
        );

        const [[metadataUrls, metadata], balances] = await Promise.all([metadataPromise, balancesPromise]); // Run in parallel.

        return ts.map((t, i) => ({
            pageId: t.id,
            id: t.token,
            metadataLink: metadataUrls[i],
            metadata: metadata[i],
            balance: balances[t.token] ?? 0n,
        }));
    };

const contractDetailsAtom = atom<ContractDetails | undefined>(undefined);
const contractTokensAtom = (() => {
    const base = atom<TokenWithPageID[]>([]);

    const derived = atom<ContractTokenDetails[], TokensAtomAction>(
        (get) =>
            get(base)
                .filter((td) => isDefined(td.metadata))
                .map(({ pageId, ...td }) => td as ContractTokenDetails),
        async (get, set, update) => {
            const contractDetails = ensureDefined(get(contractDetailsAtom), 'Needs contract details');
            const account = ensureDefined(get(selectedAccountAtom), 'No account has been selected');
            const client = get(jsonRpcClientAtom);
            const network = get(networkConfigurationAtom);
            const fetchTokens = fetchTokensConfigure(contractDetails, client, network, account);
            let topId: number | undefined;

            switch (update) {
                case 'reset': {
                    set(base, []);
                    break;
                }
                case 'next': {
                    const tokens = get(base);
                    topId = [...tokens].reverse()[0]?.pageId;

                    break;
                }
                default: {
                    throw new Error('Unsuported update type');
                }
            }

            const next = await fetchTokens(topId);
            set(base, (ts) => [...ts, ...next]);
        }
    );

    return derived;
})();
const checkedTokensAtom = atom<string[]>([]);

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

function UpdateTokens() {
    const { t } = useTranslation('account', { keyPrefix: 'tokens.add' });
    const contractDetails = useAtomValue(contractDetailsAtom);
    const account = ensureDefined(useAtomValue(selectedAccountAtom), 'Assumed account to be available');
    const [contractTokens, updateTokens] = useAtom(contractTokensAtom);
    const nav = useNavigate();
    const [accountTokens, setAccountTokens] = useAtom(currentAccountTokensAtom);
    const currentContractTokens = useMemo(
        () => (contractDetails?.index ? accountTokens.value[contractDetails.index.toString()] ?? [] : []),
        [contractDetails?.index, accountTokens.value]
    );
    const currentContractBalances = useAtomValue(
        contractBalancesFamily(account, contractDetails?.index.toString() ?? '')
    );
    const allContractTokens = useMemo(() => {
        const mapped: ContractTokenDetails[] = currentContractTokens.map((cct) => ({
            ...cct,
            balance: currentContractBalances[cct.id],
        }));
        return [...mapped, ...contractTokens.filter((ct) => !mapped.some((mt) => mt.id === ct.id))];
    }, [currentContractBalances, currentContractTokens, contractTokens]);
    const [checked, setChecked] = useAtom(checkedTokensAtom);

    if (contractDetails === undefined) {
        return <Navigate to=".." />;
    }

    const hasTokens = contractTokens.length !== 0;

    useEffect(() => {
        if (hasTokens) {
            updateTokens('next');
        }
    }, [hasTokens]);

    const showDetails = ({ balance, ...token }: ContractTokenDetails) => {
        const state: DetailsLocationState = {
            token,
            balance,
            contractIndex: contractDetails.index,
        };
        nav(`../${routes.details}`, { state });
    };

    const toggleItem = (id: string) => {
        if (checked.includes(id)) {
            setChecked((cs) => cs.filter((c) => c !== id));
        } else {
            setChecked((cs) => [...cs, id]);
        }
    };

    const storeTokens = () => {
        const newTokens = contractTokens.filter((ct) => checked.includes(ct.id)).map(({ balance, ...token }) => token);
        setAccountTokens({ contractIndex: contractDetails.index.toString(), newTokens }).then(() => {
            nav(absoluteRoutes.home.account.tokens.path);
        });
    };

    return (
        <div className="add-tokens-list">
            Contract: {contractDetails.contractName}
            <div className="add-tokens-list__tokens">
                {allContractTokens.map((token) => (
                    <Button clear className="add-tokens-list__token" onClick={() => showDetails(token)}>
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
                            onChange={() => toggleItem(token.id)}
                            checked={checked.includes(token.id)}
                        />
                    </Button>
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
    const contractDetails = useAtomValue(contractDetailsAtom);
    const updateTokens = useSetAtom(contractTokensAtom);
    const accountTokens = useAtomValue(currentAccountTokensAtom);
    const setChecked = useSetAtom(checkedTokensAtom);

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
        if (contractDetails?.index !== undefined) {
            const currentTokenIds =
                accountTokens.value[contractDetails.index.toString()]?.map((token) => token.id) ?? [];
            setChecked(currentTokenIds);
        }
    }, [accountTokens.value, contractDetails?.index]);

    return (
        <Routes>
            <Route index element={<ChooseContract />} />
            <Route path={routes.update} element={<UpdateTokens />} />
            <Route path={routes.details} element={<Details />} />
        </Routes>
    );
}
