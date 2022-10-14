import React, { useState, useMemo } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import Form, { useForm } from '@popup/shared/Form';
import Input, { Input as UncontrolledInput } from '@popup/shared/Form/Input';
import { jsonRpcClientAtom } from '@popup/store/settings';
import Submit from '@popup/shared/Form/Submit';
import { TokenIdAndMetadata, TokenMetadata } from '@shared/storage/types';
import Button from '@popup/shared/Button';
import { addToastAtom } from '@popup/state';
import { selectedAccountAtom } from '@popup/store/account';
import { tokensAtom, tokenMetadataAtom, storedTokensAtom } from '@popup/store/token';
import { absoluteRoutes } from '@popup/constants/routes';
import { confirmCIS2Contract, ContractDetails, getTokenMetadata, getTokenUrl } from '@shared/utils/token-helpers';

type FormValues = {
    contractIndex: string;
    id: string;
};

interface ChooseContractProps {
    onChoice(details: ContractDetails): void;
}

/**
 * Component used to choose the contract index for a CIS-2 compliant smart contract instance.
 */
function ChooseContract({ onChoice }: ChooseContractProps) {
    const { t } = useTranslation('account', { keyPrefix: 'tokens' });
    const form = useForm<FormValues>({
        defaultValues: {},
    });
    const client = useAtomValue(jsonRpcClientAtom);

    const onSubmit: SubmitHandler<FormValues> = async (vs) => {
        const index = BigInt(vs.contractIndex);
        const instanceInfo = await client.getInstanceInfo({ index, subindex: 0n });
        if (!instanceInfo) {
            return;
        }
        const contractName = instanceInfo.name.substring(5);
        const contractDetails = { contractName, index, subindex: 0n };
        const error = await confirmCIS2Contract(client, instanceInfo, contractDetails);
        if (error) {
            // TODO: Show error
        } else {
            onChoice(contractDetails);
        }
    };

    return (
        <Form formMethods={form} className="tokens__add__container" onSubmit={onSubmit}>
            {(f) => (
                <>
                    <Input
                        register={f.register}
                        label={t('contractIndex')}
                        name="contractIndex"
                        rules={{
                            required: t('indexRequired'),
                        }}
                    />
                    <Submit className="tokens__add__submit">{t('chooseContract')}</Submit>
                </>
            )}
        </Form>
    );
}

/**
 * Displays a CIS-2 Token
 */
function DisplayToken({ metadata }: { metadata: TokenMetadata }) {
    return (
        <div className="tokens__add__element" title={metadata.description}>
            {metadata.display?.url && (
                <img alt={metadata.name} className="tokens__add__token-display" src={metadata.display.url} />
            )}
            <p>{metadata.name}</p>
        </div>
    );
}

/**
 * Component used to pick token from a CIS-2 compliant smart contract instance.
 */
function PickTokens({
    contractDetails,
    onFinish,
    defaultTokens,
}: {
    contractDetails: ContractDetails;
    onFinish: (updatedTokenList: TokenIdAndMetadata[]) => void;
    defaultTokens: TokenIdAndMetadata[];
}) {
    const { t } = useTranslation('account', { keyPrefix: 'tokens' });
    const client = useAtomValue(jsonRpcClientAtom);
    const [accountTokens, setAccountTokens] = useState<TokenIdAndMetadata[]>(defaultTokens);
    const addToast = useSetAtom(addToastAtom);
    const form = useForm<FormValues>();

    const onSubmit: SubmitHandler<FormValues> = async ({ id }) => {
        if (accountTokens.some((token) => token.id === id)) {
            addToast(t('duplicateId'));
            return;
        }
        const tokenUrl = await getTokenUrl(client, id || '', contractDetails);
        const meta = await getTokenMetadata(tokenUrl);
        setAccountTokens((tokens) => [...tokens, { id, metadata: meta, metadataLink: tokenUrl }]);
    };

    return (
        <div className="tokens__add__container">
            <UncontrolledInput
                readOnly
                className="tokens__add__input"
                label={t('contractIndex')}
                value={contractDetails.index.toString()}
            />
            <UncontrolledInput
                readOnly
                className="tokens__add__input"
                label={t('contractName')}
                value={contractDetails.contractName}
            />
            <Form formMethods={form} className="tokens__add__add-token" onSubmit={onSubmit}>
                {(f) => (
                    <>
                        <Input register={f.register} label={t('tokenId')} name="id" />
                        <Submit>{t('addToken')}</Submit>
                    </>
                )}
            </Form>
            {accountTokens.map((token) => (
                <DisplayToken key={token.id} metadata={token.metadata} />
            ))}
            <Button onClick={() => onFinish(accountTokens)} className="tokens__add__submit">
                {t('updateTokens')}
            </Button>
        </div>
    );
}

export default function AddTokens() {
    const [contractDetails, setContractDetails] = useState<ContractDetails>();
    const [tokenMetadata, setTokenMetadata] = useAtom(tokenMetadataAtom);
    const [tokens, setTokens] = useAtom(storedTokensAtom);
    const currentTokens = useAtomValue(tokensAtom);
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
        accountCollections[contractDetails.index.toString()] = newTokens.map((token) => ({
            id: token.id,
            metadataLink: token.metadataLink,
        }));
        const updatedTokens = { ...tokens.value };
        updatedTokens[account] = accountCollections;
        const newMetadata = tokenMetadata.value;
        newTokens.forEach((token) => {
            newMetadata[token.metadataLink] = token.metadata;
        });
        setTokenMetadata(newMetadata);
        setTokens(updatedTokens).then(() => nav(absoluteRoutes.home.account.tokens.path));
    };

    const accountTokens = useMemo(() => {
        if (!account || !contractDetails || tokens.loading || !tokens.value[account]) {
            return [];
        }
        return currentTokens.value[account][contractDetails.index.toString()] || [];
    }, [account, contractDetails?.index.toString(), tokens.loading]);

    if (!account || tokens.loading) {
        return null;
    }
    if (contractDetails === undefined) {
        return <ChooseContract onChoice={setContractDetails} />;
    }
    return <PickTokens contractDetails={contractDetails} onFinish={onFinish} defaultTokens={accountTokens} />;
}
