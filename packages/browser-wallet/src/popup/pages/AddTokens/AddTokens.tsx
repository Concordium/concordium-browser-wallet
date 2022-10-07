import React, { useState, useMemo } from 'react';
import { Buffer } from 'buffer/';
import { SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import Form, { useForm } from '@popup/shared/Form';
import Input, { Input as UncontrolledInput } from '@popup/shared/Form/Input';
import { InstanceInfo, JsonRpcClient } from '@concordium/web-sdk';
import { jsonRpcClientAtom } from '@popup/store/settings';
import Submit from '@popup/shared/Form/Submit';
import { ContractMetadata, TokenIdAndMetadata } from '@shared/storage/types';
import Button from '@popup/shared/Button';
import { addToastAtom } from '@popup/state';
import { tokensAtom } from '@popup/store/account';
import { selectedAccountAtom } from '@popup/store/account';
import { useNavigate } from 'react-router-dom';
import { absoluteRoutes } from '@popup/constants/routes';

function getCIS2Identifier(): Buffer {
    const buf = Buffer.alloc(8);
    buf.writeInt16LE(1, 0);
    buf.writeInt8(5, 2);
    buf.write('CIS-2', 3, 5, 'ASCII');
    return buf;
}

function getMetadataParameter(id: string): Buffer {
    const lengths = Buffer.alloc(3);
    const idBuf = Buffer.from(id, 'ASCII');
    lengths.writeInt16LE(1, 0);
    lengths.writeInt8(idBuf.length, 2);
    return Buffer.concat([lengths, idBuf]);
}

interface ContractDetails {
    contractName: string;
    index: bigint;
    subindex: bigint;
}

async function confirmCIS2Contract(client: JsonRpcClient, instanceInfo: InstanceInfo, { contractName, index, subindex }: ContractDetails): Promise<string | undefined> {
    if (!instanceInfo.methods.includes(contractName + '.supports')) {
        return "Chosen contract does not support CIS-0";
    }
    if (!(instanceInfo.methods.includes(contractName + '.balanceOf') && instanceInfo.methods.includes(contractName + '.transfer') && instanceInfo.methods.includes(contractName +'.tokenMetadata'))) {
        return "Chosen contract does not expose required endpoints";
    }
    const supports = await client.invokeContract({ contract: { index, subindex}, method: contractName + ".supports", parameter: getCIS2Identifier() })
    if (!supports || supports.tag === "failure") {
        return "Unable to invoke chosen contract result";
    }
    if (supports.returnValue !== "010001") {
        return "Chosen contract does not support CIS-2";
    }
    return undefined;
}


export const getTokenUrl = (client: JsonRpcClient, id: string, { contractName, index, subindex }: ContractDetails): Promise<string> => {
    return new Promise((resolve) => {
        client.invokeContract({ contract: { index, subindex}, method:  contractName +  '.tokenMetadata',  parameter: getMetadataParameter(id) }).then((returnValue) => {
                    if (returnValue && returnValue.tag === 'success' && returnValue.returnValue) {
                        const bufferStream = Buffer.from(returnValue.returnValue,'hex');
                        const length = bufferStream.readUInt16LE(2);
                        const url = bufferStream.slice(4, 4 + length).toString('utf8');
                        resolve(url);
                    } else {
                        // Throw an error;
                    }
                })
    })
}

async function getTokenMetadata(tokenUrl: string): Promise<ContractMetadata> {
    if (tokenUrl !== "notfake") {
        return {
            "name": "Wrapped CCD Token",
            "symbol": "wCCD",
            "decimals": 6,
            "description": "A CIS2 token wrapping the Concordium native token (CCD)",
            "thumbnail": { "url": "https://proposals.concordium.software/_static/concordium-logo-black.svg" },
            "display": { "url": "https://proposals.concordium.software/_static/concordium-logo-black.svg" },
            "artifact": { "url": "https://proposals.concordium.software/_static/concordium-logo-black.svg" },
        }
    }
    const resp = await fetch(tokenUrl, {headers: new Headers({"Access-Control-Allow-Origin": "*" }), mode: 'cors'})
    if (!resp.ok) {
        throw new Error('Something went wrong, status: ' + resp.status);
    }
    return await resp.json();
}

export type FormValues = {
    contractIndex: string;
    id: string;
};

interface ChooseContractProps {
    onChoice(details: ContractDetails): void;
}

function ChooseContract({ onChoice } : ChooseContractProps) {
    const { t } = useTranslation('account', { keyPrefix: 'tokens'});
    const form = useForm<FormValues>({
        defaultValues: {
        },
    });
    const client = useAtomValue(jsonRpcClientAtom);

    const onSubmit: SubmitHandler<FormValues> = async (vs) => {
        const index = BigInt(vs.contractIndex);
        const instanceInfo = await client.getInstanceInfo({ index, subindex: 0n });
        if (!instanceInfo) {
            return "unable to load information about chosen instance";
        }
        const contractName = instanceInfo.name.substring(5);
        const contractDetails = {contractName, index, subindex: 0n };
        const error = await confirmCIS2Contract(client, instanceInfo, contractDetails);
        if (error) {
            // TODO: Show error
        } else {
            onChoice(contractDetails);
        }
    };

    return (
        <Form
        formMethods={form}
        className="tokens__add__container"
        onSubmit={onSubmit}
        >
        {(f) => (<><Input register={f.register} label="Contract index" name="contractIndex"
                       rules={{
                           required: t('indexRequired')
                       }}
                />
                <Submit>{t('chooseContract')}</Submit>
            </>)}
        </Form>
    );
}

function Token({metadata} : { metadata: ContractMetadata}) {
    return (<>
        <div className="tokens__add__element" title={metadata.description} >
        {metadata.display?.url && (<img alt={metadata.name} className="tokens__add__token-display" src={metadata.display.url}/>)}
            <p>{metadata.name}</p>
        </div>
    </>)
}

function AddToken({ contractDetails, onFinish, defaultTokens} : { contractDetails: ContractDetails, onFinish: (updatedTokenList: TokenIdAndMetadata[]) => void, defaultTokens: TokenIdAndMetadata[]}) {
    const { t } = useTranslation('account', { keyPrefix: 'tokens'});
    const client = useAtomValue(jsonRpcClientAtom);
    const [accountTokens, setAccountTokens] = useState<TokenIdAndMetadata[]>(defaultTokens);
    const addToast = useSetAtom(addToastAtom);
    const form = useForm<FormValues>();

    const onSubmit: SubmitHandler<FormValues> = async ({ id }) => {
        if (accountTokens.some((token) => token.id === id)) {
            addToast(t('duplicateId'));
            return;
        }
        const tokenUrl = await getTokenUrl(client, id || "", contractDetails);
        const meta = await getTokenMetadata(tokenUrl);
        setAccountTokens((tokens) => [...tokens, {id, metadata: meta}])
    };

    return (
                <div className="tokens__add__container">
                    <UncontrolledInput label={t('contractIndex')} value={contractDetails.index.toString()} />
                    <UncontrolledInput label={t('contractName')} value={contractDetails.contractName} />
                    <Form
                formMethods={form}
                className="tokens__add__add-token"
                onSubmit={onSubmit}
                    >
            {(f) => (
                <><Input register={f.register} label={t('tokenId')} name="id"/>
                    <Submit>{t('addToken')}</Submit></>
            )}
                    </Form>
            {accountTokens.map((token) => (<Token key={token.id} metadata={token.metadata} />))}
            <Button onClick={() => onFinish(accountTokens)} className="m-t-auto">{t('chooseContract')}</Button>
                </div>
    );
}

export default function Main() {
    const [contractDetails, setContractDetails] = useState<ContractDetails>();
    const [tokens, setTokens] = useAtom(tokensAtom);
    const account = useAtomValue(selectedAccountAtom);
    const nav = useNavigate();

    const onFinish = (newTokens: TokenIdAndMetadata[]) => {
        if (tokens.loading) {
            return;
        }
        if (!account || !contractDetails) {
            // TODO: handle this
            return;
        }
        const accountCollections = tokens.value[account] || {};
        accountCollections[contractDetails.index.toString()] = newTokens;
        const updatedTokens = {...tokens.value};
        updatedTokens[account] = accountCollections;
        setTokens(updatedTokens).then(() => nav(absoluteRoutes.home.account.tokens.path))        ;
    };

    const accountTokens = useMemo(() => {
        if (!account || !contractDetails || tokens.loading || !tokens.value[account]) {
            return [];
        }
        return tokens.value[account][contractDetails.index.toString()] || [];
    }, [account, contractDetails?.index.toString(), tokens.loading])

    if (!account || tokens.loading) {
        return null;
    } else if (contractDetails === undefined) {
        return (
            <ChooseContract onChoice={setContractDetails}/>
        );
    } else {
        return (
            <AddToken contractDetails={contractDetails} onFinish={onFinish} defaultTokens={accountTokens}/>
        );
    }
}
