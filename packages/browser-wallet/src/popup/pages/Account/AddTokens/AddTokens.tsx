import React, { useContext, useEffect, useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { Navigate, Route, Routes, useLocation, useNavigate, Location } from 'react-router-dom';
import Form from '@popup/shared/Form';
import Input from '@popup/shared/Form/Input';
import Submit from '@popup/shared/Form/Submit';
import { addToastAtom } from '@popup/state';
import { jsonRpcClientAtom } from '@popup/store/settings';
import { TokenIdAndMetadata } from '@shared/storage/types';
import { confirmCIS2Contract, ContractDetails } from '@shared/utils/token-helpers';
import TokenDetails from '@popup/shared/TokenDetails';
import { accountPageContext } from '../utils';

const routes = {
    update: 'update',
    details: 'details',
};

type FormValues = {
    contractIndex: string;
};

interface ChooseContractProps {
    initialContractIndex: bigint | undefined;
    onChoice(details: ContractDetails): void;
}

/**
 * Component used to choose the contract index for a CIS-2 compliant smart contract instance.
 */
function ChooseContract({ onChoice, initialContractIndex }: ChooseContractProps) {
    const { t } = useTranslation('account', { keyPrefix: 'tokens.add' });
    const addToast = useSetAtom(addToastAtom);
    const form = useForm<FormValues>({
        defaultValues: { contractIndex: initialContractIndex?.toString() },
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
        const contractDetails = { contractName, index, subindex: 0n };
        const error = await confirmCIS2Contract(client, contractDetails);
        if (error) {
            addToast(error);
        } else {
            onChoice(contractDetails);
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

type UpdateTokensProps = {
    contractDetails: ContractDetails;
};

function UpdateTokens({ contractDetails }: UpdateTokensProps) {
    return <>Contract: {contractDetails.contractName}</>;
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
    const [contractDetails, setContractDetails] = useState<ContractDetails>();

    useEffect(() => {
        setDetailsExpanded(false);
        return () => setDetailsExpanded(true);
    }, []);

    return (
        <Routes>
            <Route
                index
                element={<ChooseContract initialContractIndex={contractDetails?.index} onChoice={setContractDetails} />}
            />
            <Route
                path={routes.update}
                element={
                    contractDetails !== undefined ? (
                        <UpdateTokens contractDetails={contractDetails} />
                    ) : (
                        <Navigate to=".." />
                    )
                }
            />
            <Route path={routes.details} element={<Details />} />
        </Routes>
    );
}
