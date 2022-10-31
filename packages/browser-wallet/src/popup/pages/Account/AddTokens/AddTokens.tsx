import React, { useContext, useEffect } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes, useLocation, useNavigate, Location } from 'react-router-dom';

import Form from '@popup/shared/Form';
import FormInput from '@popup/shared/Form/Input';
import Submit from '@popup/shared/Form/Submit';
import { addToastAtom } from '@popup/state';
import { jsonRpcClientAtom } from '@popup/store/settings';
import { confirmCIS2Contract, ContractDetails } from '@shared/utils/token-helpers';
import TokenDetails from '@popup/shared/TokenDetails';
import { selectedAccountAtom } from '@popup/store/account';
import { ensureDefined } from '@shared/utils/basic-helpers';
import { contractBalancesFamily, currentAccountTokensAtom } from '@popup/store/token';
import { accountPageContext } from '../utils';
import {
    checkedTokensAtom,
    contractDetailsAtom,
    contractTokensAtom,
    listScrollPositionAtom,
    searchAtom,
    searchResultAtom,
    topTokensAtom,
} from './state';
import { ContractTokenDetails, routes, DetailsLocationState } from './utils';
import TokenList from './TokenList';

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
    useAtom(listScrollPositionAtom);

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
            <Route path={routes.update} element={<TokenList />} />
            <Route path={routes.details} element={<Details />} />
        </Routes>
    );
}
