import React, { useContext, useEffect } from 'react';
import { atom, useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes, useLocation, useNavigate, Location } from 'react-router-dom';
import { isDefined, MakeOptional } from 'wallet-common-helpers';
import { JsonRpcClient } from '@concordium/web-sdk';
import Form from '@popup/shared/Form';
import Input from '@popup/shared/Form/Input';
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
import { accountPageContext } from '../utils';

type TokensAtomAction = 'reset' | 'next';
type ContractTokenDetails = TokenIdAndMetadata & {
    balance: bigint;
};

const TOKENS_PAGE_SIZE = 20;

type TokenWithPageID = MakeOptional<ContractTokenDetails, 'metadata'> & {
    pageId: number;
};

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
                metadataUrls.map((url) => {
                    try {
                        return getTokenMetadata(url, network);
                    } catch {
                        return Promise.resolve(undefined);
                    }
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
                    topId = tokens.reverse()[0]?.pageId;

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

const routes = {
    update: 'update',
    details: 'details',
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
                        <Input
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
    const contractDetails = useAtomValue(contractDetailsAtom);
    const [contractTokens, updateTokens] = useAtom(contractTokensAtom);

    if (contractDetails === undefined) {
        return <Navigate to=".." />;
    }

    useEffect(() => {
        updateTokens('next');
    }, []);

    return (
        <div>
            Contract: {contractDetails.contractName}
            <br />
            Tokens: {contractTokens.length}
        </div>
    );
}

type DetailsLocationState = {
    contractIndex: bigint;
    token: TokenIdAndMetadata;
    balance: bigint;
};

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

    useEffect(() => {
        setDetailsExpanded(false);
        return () => setDetailsExpanded(true);
    }, []);

    useEffect(() => {
        if (contractDetails !== undefined) {
            updateTokens('reset');
        }
    }, [contractDetails?.index]);

    return (
        <Routes>
            <Route index element={<ChooseContract />} />
            <Route path={routes.update} element={<UpdateTokens />} />
            <Route path={routes.details} element={<Details />} />
        </Routes>
    );
}
