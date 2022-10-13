import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue } from 'jotai';
import { selectedAccountAtom, tokensAtom } from '@popup/store/account';
import Form from '@popup/shared/Form';
import AmountInput from '@popup/shared/Form/CcdInput';
import Input from '@popup/shared/Form/Input';
import {
    ccdToMicroCcd,
    getPublicAccountAmounts,
    microCcdToCcd,
    fractionalToInteger,
    getCcdSymbol,
    useAsyncMemo,
    integerToFractional,
} from 'wallet-common-helpers';
import { SimpleTransferPayload } from '@concordium/web-sdk';
import { SubmitHandler, useForm, Validate } from 'react-hook-form';
import Submit from '@popup/shared/Form/Submit';
import {
    buildSimpleTransferPayload,
    validateTransferAmount,
    validateAccountAddress,
} from '@popup/shared/utils/transaction-helpers';
import { useLocation, useNavigate } from 'react-router-dom';
import DisplayCost from '@popup/shared/TransactionReceipt/DisplayCost';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import { useSelectedCredential } from '@popup/shared/utils/account-helpers';
import Button from '@popup/shared/Button';
import { TokenMetadata } from '@shared/storage/types';
import { CCD_METADATA, getTokenBalance, TokenIdentifier } from '@shared/utils/token-helpers';
import { jsonRpcClientAtom } from '@popup/store/settings';
import { routes } from './routes';

export type FormValues = {
    amount: string;
    recipient: string;
    token?: TokenIdentifier;
};

interface Props {
    cost?: bigint;
}

type State = undefined | (SimpleTransferPayload & Partial<TokenIdentifier>);

interface ChooseTokenProps {
    onChoice: () => void;
    metadata: TokenMetadata;
}

function ChooseToken({ onChoice, metadata }: ChooseTokenProps) {
    return (
        <Button className="send-ccd__create-transfer__pick-token__element" clear onClick={onChoice}>
            {metadata.name}
        </Button>
    );
}

export default function CreateTransaction({ cost = 0n }: Props) {
    const { t } = useTranslation('account');
    const { t: tShared } = useTranslation('shared');
    const { state } = useLocation();
    const defaultPayload = state as State;
    const address = useAtomValue(selectedAccountAtom);
    const selectedCred = useSelectedCredential();
    const nav = useNavigate();
    const form = useForm<FormValues>({
        defaultValues: {
            amount: microCcdToCcd(defaultPayload?.amount.microGtuAmount),
            recipient: defaultPayload?.toAddress.address,
            token:
                defaultPayload?.contractIndex !== undefined && defaultPayload?.tokenId !== undefined
                    ? { contractIndex: defaultPayload.contractIndex, tokenId: defaultPayload.tokenId }
                    : undefined,
        },
    });
    const client = useAtomValue(jsonRpcClientAtom);
    const chosenToken = form.watch('token');
    const tokenMetadata = useMemo(() => chosenToken?.metadata || CCD_METADATA, [chosenToken?.metadata]);
    const tokens = useAtomValue(tokensAtom);
    const accountTokens = useMemo(
        () => (!tokens.loading && address ? Object.entries(tokens.value[address] || []) : undefined),
        [tokens.loading, address]
    );
    const [pickingToken, setPickingToken] = useState<boolean>(false);

    if (!address || !selectedCred) {
        throw new Error('Missing selected accoount');
    }

    const accountInfo = useAccountInfo(selectedCred);

    const currentBalance = useAsyncMemo(
        () => {
            if (!chosenToken) {
                return Promise.resolve(getPublicAccountAmounts(accountInfo).atDisposal - cost);
            }
            return getTokenBalance(client, address, chosenToken);
        },
        () => {
            // TODO: toast
        },
        [chosenToken, accountInfo?.accountAmount]
    );

    const validateAmount: Validate<string> = (amount) =>
        validateTransferAmount(amount, currentBalance, tokenMetadata.decimals, chosenToken ? 0n : cost);

    const maxValue = useMemo(() => {
        if (currentBalance) {
            return chosenToken ? currentBalance : currentBalance - cost;
        }
        return undefined;
    }, [Boolean(chosenToken), currentBalance]);

    useEffect(() => {
        // TODO: change only if new account does not have chosen token/reset to initial token.
        form.setValue('token', undefined);
    }, [address]);

    useEffect(() => {
        form.setValue('amount', '');
    }, [chosenToken]);

    const displayAmount = integerToFractional(tokenMetadata.decimals || 0);

    const onMax = () => {
        form.setValue('amount', displayAmount(maxValue) || '0');
    };

    if (tokens.loading || !maxValue) {
        return null;
    }

    const onSubmit: SubmitHandler<FormValues> = (vs) => {
        if (vs.token) {
            // TODO: proper conversion/don't crash on decimals
            const metadata = tokens.value[address][vs.token.contractIndex].find(
                (token) => token.id === vs.token?.tokenId
            );
            if (!metadata) {
                throw new Error('Unable to find metadata for chosen token');
            }
            const maxDecimals = metadata.metadata.decimals || 0;
            const payload = buildSimpleTransferPayload(vs.recipient, fractionalToInteger(vs.amount, maxDecimals));
            nav(routes.confirmToken, { state: { ...payload, ...vs.token } });
        } else {
            const payload = buildSimpleTransferPayload(vs.recipient, ccdToMicroCcd(vs.amount));
            nav(routes.confirm, { state: { ...payload } });
        }
    };

    if (pickingToken && accountTokens) {
        return (
            <div className="send-ccd__create-transfer__pick-token">
                <ChooseToken
                    metadata={CCD_METADATA}
                    onChoice={() => {
                        setPickingToken(false);
                        form.setValue('token', undefined);
                    }}
                />
                {accountTokens.map(([contractIndex, collectionTokens]) =>
                    collectionTokens.map((token) => (
                        <ChooseToken
                            key={`${contractIndex}+${token.id}`}
                            metadata={token.metadata}
                            onChoice={() => {
                                setPickingToken(false);
                                form.setValue('token', { contractIndex, tokenId: token.id, metadata: token.metadata });
                            }}
                        />
                    ))
                )}
            </div>
        );
    }

    // TODO Fix register/validate type error
    return (
        <Form
            formMethods={form}
            className="flex-column justify-space-between align-center h-full w-full"
            onSubmit={onSubmit}
        >
            {(f) => (
                <>
                    <p className="m-v-10 text-center">{t('sendCcd.title')}</p>
                    <Button
                        className="send-ccd__create-transfer__token-picker"
                        clear
                        disabled={!accountTokens}
                        onClick={() => setPickingToken(true)}
                    >
                        {chosenToken ? chosenToken.metadata.name : CCD_METADATA.name}
                    </Button>
                    <p className="m-v-10 text-center">
                        {`${t('sendCcd.currentBalance')}: ${displayAmount(currentBalance) || '0'}`}
                    </p>
                    <AmountInput
                        register={f.register}
                        name="amount"
                        symbol={chosenToken ? chosenToken.metadata.symbol || '' : getCcdSymbol()}
                        label={t('sendCcd.labels.ccd')}
                        className="send-ccd__create-transfer__input"
                        onMax={onMax}
                        rules={{
                            required: tShared('utils.ccdAmount.required'),
                            validate: validateAmount,
                        }}
                    />
                    <Input
                        register={f.register}
                        name="recipient"
                        label={t('sendCcd.labels.recipient')}
                        className="send-ccd__create-transfer__input"
                        rules={{
                            required: tShared('utils.address.required'),
                            validate: validateAccountAddress,
                        }}
                    />
                    <DisplayCost cost={cost} />

                    <Submit className="send-ccd__create-transfer__button" width="medium">
                        {t('sendCcd.buttons.continue')}
                    </Submit>
                </>
            )}
        </Form>
    );
}
