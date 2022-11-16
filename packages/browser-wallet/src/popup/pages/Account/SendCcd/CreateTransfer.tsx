import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { AccountTokens, contractBalancesFamily, Tokens, tokensAtom } from '@popup/store/token';
import { selectedAccountAtom } from '@popup/store/account';
import Form from '@popup/shared/Form';
import AmountInput from '@popup/shared/Form/AmountInput';
import Input from '@popup/shared/Form/Input';
import {
    ccdToMicroCcd,
    getPublicAccountAmounts,
    fractionalToInteger,
    useAsyncMemo,
    integerToFractional,
    max,
    displayAsCcd,
} from 'wallet-common-helpers';
import { SimpleTransferPayload } from '@concordium/web-sdk';
import { SubmitHandler, useForm, Validate } from 'react-hook-form';
import clsx from 'clsx';
import { useLocation, useNavigate } from 'react-router-dom';

import Submit from '@popup/shared/Form/Submit';
import {
    buildSimpleTransferPayload,
    validateTransferAmount,
    validateAccountAddress,
} from '@popup/shared/utils/transaction-helpers';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import { useSelectedCredential } from '@popup/shared/utils/account-helpers';
import { CCD_METADATA } from '@shared/constants/token-metadata';
import {
    getMetadataDecimals,
    getTokenTransferEnergy,
    TokenIdentifier,
    trunctateSymbol,
} from '@shared/utils/token-helpers';
import { jsonRpcClientAtom } from '@popup/store/settings';
import CcdIcon from '@assets/svg/concordium.svg';
import { addToastAtom } from '@popup/state';
import TokenBalance from '@popup/shared/TokenBalance';
import Button from '@popup/shared/Button';
import SearchIcon from '@assets/svg/search.svg';
import { SIMPLE_TRANSFER_ENERGY_TOTAL_COST } from '@shared/utils/energy-helpers';
import Img from '@popup/shared/Img';
import { routes } from './routes';
import PickToken from './PickToken';

export type FormValues = {
    amount: string;
    recipient: string;
    executionEnergy: string;
    cost: string;
    token?: TokenIdentifier;
};

interface Props {
    exchangeRate?: number;
    cost: bigint;
    setCost: (cost: bigint) => void;
    setDetailsExpanded: (expanded: boolean) => void;
}

/**
 * undefined is used to denote "not resolved yet", to align with useAsyncMemo return type
 */
type FeeResult = { success: true; value: bigint } | { success: false } | undefined;

type State = undefined | (SimpleTransferPayload & Partial<TokenIdentifier>);

function createDefaultValues(defaultPayload: State, accountTokens?: AccountTokens) {
    let token;
    let decimals = 6;
    if (defaultPayload?.contractIndex) {
        const metadata = accountTokens?.[defaultPayload.contractIndex]?.find(
            (t) => t.id === defaultPayload.tokenId
        )?.metadata;
        token = { contractIndex: defaultPayload.contractIndex, tokenId: defaultPayload.tokenId, metadata };
        decimals = getMetadataDecimals(metadata ?? {});
    }
    return {
        amount: integerToFractional(decimals)(defaultPayload?.amount?.microCcdAmount),
        recipient: defaultPayload?.toAddress.address,
        token,
    };
}

function CreateTransaction({ exchangeRate, tokens, setCost, setDetailsExpanded, cost }: Props & { tokens: Tokens }) {
    const { t } = useTranslation('account');
    const { t: tShared } = useTranslation('shared');
    const { state } = useLocation();
    const address = useAtomValue(selectedAccountAtom);
    const selectedCred = useSelectedCredential();
    const nav = useNavigate();
    const accountTokens = useMemo(() => (address ? tokens[address] || {} : undefined), [tokens, address]);
    const form = useForm<FormValues>({
        defaultValues: createDefaultValues(state as State, accountTokens),
    });
    const client = useAtomValue(jsonRpcClientAtom);
    const chosenToken = form.watch('token');
    const recipient = form.watch('recipient');
    const tokenMetadata = useMemo(() => chosenToken?.metadata || CCD_METADATA, [chosenToken?.metadata]);
    const [pickingToken, setPickingToken] = useState<boolean>(false);
    const addToast = useSetAtom(addToastAtom);

    if (!address || !selectedCred) {
        throw new Error('Missing selected accoount');
    }

    const [contractBalances] = useAtom(contractBalancesFamily(address, chosenToken?.contractIndex || ''));

    const fee = useAsyncMemo<FeeResult>(
        async () => {
            if (chosenToken) {
                if (validateAccountAddress(recipient)) {
                    return undefined;
                }
                try {
                    const energy = await getTokenTransferEnergy(
                        client,
                        address,
                        recipient,
                        chosenToken.tokenId,
                        BigInt(chosenToken.contractIndex)
                    );
                    form.setValue('executionEnergy', energy.execution.toString());
                    return { success: true, value: energy.total };
                } catch (e) {
                    addToast(t('sendCcd.transferInvokeFailed', { message: (e as Error).message }));
                    return { success: false };
                }
            }
            return { success: true, value: SIMPLE_TRANSFER_ENERGY_TOTAL_COST };
        },
        undefined,
        [chosenToken?.contractIndex, chosenToken?.tokenId, recipient]
    );

    useEffect(() => {
        setCost(exchangeRate && fee?.success ? BigInt(Math.ceil(exchangeRate * Number(fee.value))) : 0n);
    }, [fee, exchangeRate]);

    const accountInfo = useAccountInfo(selectedCred);

    const ccdBalance = getPublicAccountAmounts(accountInfo).atDisposal;
    const currentBalance = useMemo(() => {
        if (!chosenToken) {
            return ccdBalance;
        }
        return contractBalances[chosenToken.tokenId];
    }, [chosenToken, ccdBalance]);

    const validateAmount: Validate<string> = (amount) =>
        validateTransferAmount(amount, currentBalance, getMetadataDecimals(tokenMetadata), chosenToken ? 0n : cost);

    const maxValue = useMemo(() => {
        if (currentBalance !== undefined) {
            return chosenToken ? currentBalance : max(0n, currentBalance - cost);
        }
        return undefined;
    }, [Boolean(chosenToken), currentBalance, cost]);

    useEffect(() => {
        // Reset chosen token if the current account is changed and the new account does not have the chosen token.
        if (
            chosenToken &&
            (!accountTokens ||
                !accountTokens[chosenToken.contractIndex]?.some((token) => token.id === chosenToken.tokenId))
        ) {
            form.setValue('token', undefined);
        }
    }, [address]);

    useEffect(() => {
        // Reset amount if the token is changed
        return () => form.setValue('amount', '');
    }, [chosenToken?.contractIndex, chosenToken?.tokenId]);

    const canCoverCost = ccdBalance - cost > 0;

    useEffect(() => {
        if (!canCoverCost) {
            form.setError('cost', { type: 'custom', message: t('sendCcd.unableToCoverCost') });
        } else if (fee && !fee.success) {
            form.setError('cost', { type: 'custom', message: t('sendCcd.unableToSendFailedInvoke') });
        } else {
            form.clearErrors('cost');
        }
    }, [canCoverCost, fee]);

    const displayAmount = integerToFractional(getMetadataDecimals(tokenMetadata));

    const onMax = () => {
        form.setValue('amount', displayAmount(maxValue) || '0');
    };

    if (maxValue === undefined) {
        return null;
    }

    const onSubmit: SubmitHandler<FormValues> = (vs) => {
        if (vs.token) {
            const payload = buildSimpleTransferPayload(
                vs.recipient,
                fractionalToInteger(vs.amount, getMetadataDecimals(vs.token.metadata))
            );
            nav(routes.confirmToken, { state: { ...payload, ...vs.token, executionEnergy: vs.executionEnergy } });
        } else {
            const payload = buildSimpleTransferPayload(vs.recipient, ccdToMicroCcd(vs.amount));
            nav(routes.confirm, { state: { ...payload } });
        }
    };

    if (pickingToken) {
        return (
            <PickToken
                address={address}
                tokens={accountTokens}
                onClick={(chosen: TokenIdentifier | undefined) => {
                    setPickingToken(false);
                    form.setValue('token', chosen);
                }}
                ccdBalance={ccdBalance}
                setDetailsExpanded={setDetailsExpanded}
            />
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
                    <div className="create-transfer__token-picker">
                        <Button className="token-picker-button" clear onClick={() => setPickingToken(true)}>
                            <div className="token-picker-button__token-display-container">
                                <div className="flex align-center w-full">
                                    {tokenMetadata === CCD_METADATA ? (
                                        <div className="token-picker-button__token-display">
                                            <CcdIcon className="ccd-icon" />
                                        </div>
                                    ) : (
                                        <Img
                                            alt={tokenMetadata.name}
                                            className="token-picker-button__token-display"
                                            src={tokenMetadata.thumbnail?.url ?? tokenMetadata.display?.url}
                                            withDefaults
                                        />
                                    )}
                                    <div className="token-picker-button__details">
                                        <div className="clamp-1 w-full">{tokenMetadata.name}</div>
                                        <div className="token-picker-button__balance">
                                            <TokenBalance
                                                decimals={getMetadataDecimals(tokenMetadata)}
                                                symbol={tokenMetadata.symbol}
                                                balance={currentBalance}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <SearchIcon className="token-picker-button__search-icon" />
                            </div>
                        </Button>
                    </div>
                    <AmountInput
                        register={f.register}
                        name="amount"
                        symbol={trunctateSymbol(tokenMetadata.symbol || '')}
                        label={t('sendCcd.labels.ccd')}
                        className="create-transfer__input"
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
                        className="create-transfer__input"
                        rules={{
                            required: tShared('utils.address.required'),
                            validate: validateAccountAddress,
                        }}
                    />
                    <div
                        className={clsx(
                            'create-transfer__cost',
                            f.formState.errors.cost && 'create-transfer__cost--error'
                        )}
                    >
                        <p>
                            {t('sendCcd.fee')}: {cost ? displayAsCcd(cost) : t('unknown')}
                        </p>
                        {f.formState.errors.cost && <p className="m-0">{f.formState.errors.cost.message}</p>}
                    </div>
                    <Submit className="create-transfer__button" width="medium">
                        {t('sendCcd.buttons.continue')}
                    </Submit>
                </>
            )}
        </Form>
    );
}

export default function LoadingTokensGuard({ ...props }: Props) {
    const tokens = useAtomValue(tokensAtom);
    if (tokens.loading) {
        return null;
    }
    return <CreateTransaction tokens={tokens.value} {...props} />;
}
