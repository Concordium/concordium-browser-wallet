import React, { useState, useMemo, useEffect } from 'react';
import { SubmitHandler } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import Form, { useForm } from '@popup/shared/Form';
import Input, { Input as UncontrolledInput } from '@popup/shared/Form/Input';
import { jsonRpcClientAtom, networkConfigurationAtom } from '@popup/store/settings';
import Submit from '@popup/shared/Form/Submit';
import { TokenIdAndMetadata, TokenMetadata } from '@shared/storage/types';
import Button from '@popup/shared/Button';
import { addToastAtom } from '@popup/state';
import { currentAccountTokensAtom } from '@popup/store/token';
import { selectedAccountAtom } from '@popup/store/account';
import { absoluteRoutes } from '@popup/constants/routes';
import { confirmCIS2Contract, ContractDetails, getTokenMetadata, getTokenUrl } from '@shared/utils/token-helpers';
import { Checkbox } from '@popup/shared/Form/Checkbox';
import { isHex } from '@concordium/web-sdk';

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
    const addToast = useSetAtom(addToastAtom);
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
        const error = await confirmCIS2Contract(client, contractDetails);
        if (error) {
            addToast(error);
        } else {
            onChoice(contractDetails);
        }
    };

    return (
        <Form formMethods={form} className="add-tokens__one-line-form" onSubmit={onSubmit}>
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
                    <Submit>{t('chooseContract')}</Submit>
                </>
            )}
        </Form>
    );
}

/**
 * Displays a CIS-2 Token
 */
function DisplayToken({
    chosen,
    metadata,
    onClick,
}: {
    chosen: boolean;
    metadata: TokenMetadata;
    onClick: () => void;
}) {
    return (
        <div
            className="add-tokens__element"
            title={metadata.description}
            onClick={onClick}
            role="button"
            onKeyPress={onClick}
            tabIndex={0}
        >
            <div className="add-tokens__token-display-container">
                {metadata.display?.url && (
                    <img alt={metadata.name} className="add-tokens__token-display" src={metadata.display.url} />
                )}
            </div>
            <p>{metadata.name}</p>
            <Checkbox readOnly tabIndex={-1} label="test" className="add-tokens__checkbox" checked={chosen} />
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
    const network = useAtomValue(networkConfigurationAtom);
    const [accountTokens, setAccountTokens] = useState<(TokenIdAndMetadata & { chosen: boolean })[]>([]);
    const addToast = useSetAtom(addToastAtom);
    const form = useForm<FormValues>();

    useEffect(() => {
        setAccountTokens(defaultTokens.map((token) => ({ ...token, chosen: true })));
    }, [contractDetails?.index.toString()]);

    const onSubmit: SubmitHandler<FormValues> = async ({ id }) => {
        if (accountTokens.some((token) => token.id === id)) {
            addToast(t('duplicateId'));
            return;
        }
        try {
            const tokenUrl = await getTokenUrl(client, [id] || '', contractDetails);
            const meta = await getTokenMetadata(tokenUrl, network);

            setAccountTokens((tokens) => [...tokens, { id, metadata: meta, metadataLink: tokenUrl, chosen: true }]);
        } catch (e) {
            addToast((e as Error).message);
        }
    };

    const chooseToken = (index: number) => {
        const token = accountTokens[index];
        accountTokens[index] = { ...token, chosen: !token.chosen };
        setAccountTokens([...accountTokens]);
    };

    const validateId = (id: string | undefined) => {
        if (!id || isHex(id)) {
            return undefined;
        }
        return t('hexId');
    };

    return (
        <>
            <UncontrolledInput
                readOnly
                className="add-tokens__input"
                label={t('contractName')}
                value={contractDetails.contractName}
            />
            <Form formMethods={form} className="add-tokens__one-line-form" onSubmit={onSubmit}>
                {(f) => (
                    <>
                        <Input register={f.register} label={t('tokenId')} rules={{ validate: validateId }} name="id" />
                        <Submit>{t('addToken')}</Submit>
                    </>
                )}
            </Form>
            <div className="add-tokens__token-container">
                {accountTokens.map((token, index) => (
                    <DisplayToken
                        key={token.id}
                        chosen={token.chosen}
                        metadata={token.metadata}
                        onClick={() => chooseToken(index)}
                    />
                ))}
            </div>
            <Button
                onClick={() =>
                    onFinish(accountTokens.filter((token) => token.chosen).map(({ chosen, ...token }) => token))
                }
                className="add-tokens__submit"
            >
                {t('updateTokens')}
            </Button>
        </>
    );
}

export default function AddTokens() {
    const [contractDetails, setContractDetails] = useState<ContractDetails>();
    const [accountTokens, setAccountTokens] = useAtom(currentAccountTokensAtom);
    const account = useAtomValue(selectedAccountAtom);
    const nav = useNavigate();

    const onFinish = (newTokens: TokenIdAndMetadata[]) => {
        if (!contractDetails) {
            throw new Error('This function should not be invoked without a chosen contract');
        }
        setAccountTokens({ contractIndex: contractDetails.index.toString(), newTokens }).then(() =>
            nav(absoluteRoutes.home.account.tokens.path)
        );
    };

    const currentCollection = useMemo(() => {
        if (!account || !contractDetails || accountTokens.loading || !accountTokens.value) {
            return [];
        }
        return accountTokens.value[contractDetails.index.toString()] || [];
    }, [account, contractDetails?.index.toString(), accountTokens.loading]);

    if (!account || accountTokens.loading) {
        return null;
    }

    return (
        <div className="add-tokens__container">
            <ChooseContract onChoice={setContractDetails} />
            {contractDetails !== undefined && (
                <PickTokens contractDetails={contractDetails} onFinish={onFinish} defaultTokens={currentCollection} />
            )}
        </div>
    );
}
