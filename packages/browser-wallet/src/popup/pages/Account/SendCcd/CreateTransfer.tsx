import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { AccountTokens, contractBalancesFamily, Tokens, tokensAtom } from '@popup/store/token';
import { selectedAccountAtom } from '@popup/store/account';
import Form from '@popup/shared/Form';
import AmountInput from '@popup/shared/Form/AmountInput';
import Input from '@popup/shared/Form/Input';
import {
    getPublicAccountAmounts,
    fractionalToInteger,
    useAsyncMemo,
    integerToFractional,
    max,
    displayAsCcd,
} from 'wallet-common-helpers';
import { convertEnergyToMicroCcd, AccountAddress, Energy } from '@concordium/web-sdk';
import { SubmitHandler, useForm, Validate } from 'react-hook-form';
import clsx from 'clsx';
import { useLocation, useNavigate } from 'react-router-dom';

import Submit from '@popup/shared/Form/Submit';
import { validateTransferAmount, validateAccountAddress } from '@popup/shared/utils/transaction-helpers';
import { useAccountInfo } from '@popup/shared/AccountInfoListenerContext';
import { useSelectedCredential } from '@popup/shared/utils/account-helpers';
import { CCD_METADATA } from '@shared/constants/token-metadata';
import {
    getMetadataDecimals,
    getTokenTransferEnergy,
    TokenIdentifier,
    trunctateSymbol,
} from '@shared/utils/token-helpers';
import { grpcClientAtom } from '@popup/store/settings';
import CcdIcon from '@assets/svg/concordium.svg';
import { addToastAtom } from '@popup/state';
import TokenBalance from '@popup/shared/TokenBalance';
import Button from '@popup/shared/Button';
import SearchIcon from '@assets/svg/search.svg';
import { SIMPLE_TRANSFER_ENERGY_TOTAL_COST } from '@shared/utils/energy-helpers';
import Img from '@popup/shared/Img';
import { useBlockChainParameters } from '@popup/shared/BlockChainParametersProvider';
import { routes } from './routes';
import PickToken from './PickToken';
import { buildConfirmState, ConfirmTransferState, CreateTransferFormValues } from './util';

interface Props {
    cost: bigint;
    setCost: (cost: bigint) => void;
    setDetailsExpanded: (expanded: boolean) => void;
}

const getNextRoute = (token?: TokenIdentifier) => {
    if (token) {
        return routes.confirmToken;
    }
    return routes.confirm;
};

/**
 * undefined is used to denote "not resolved yet", to align with useAsyncMemo return type
 */
type FeeResult = { success: true; value: Energy.Type } | { success: false } | undefined;

type State = undefined | ConfirmTransferState;

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
        amount: integerToFractional(decimals)(defaultPayload?.amount),
        recipient: defaultPayload?.toAddress,
        token,
    };
}

function CreateTransaction({ tokens, setCost, setDetailsExpanded, cost }: Props & { tokens: Tokens }) {
    const { t } = useTranslation('account');
    const { t: tShared } = useTranslation('shared');
    const { state, pathname } = useLocation();
    const address = useAtomValue(selectedAccountAtom);
    const selectedCred = useSelectedCredential();
    const nav = useNavigate();
    const accountTokens = useMemo(() => (address ? tokens[address] || {} : undefined), [tokens, address]);
    const form = useForm<CreateTransferFormValues>({
        defaultValues: createDefaultValues(state as State, accountTokens),
    });
    const client = useAtomValue(grpcClientAtom);
    const chosenToken = form.watch('token');
    const recipient = form.watch('recipient');
    const tokenMetadata = useMemo(() => chosenToken?.metadata || CCD_METADATA, [chosenToken?.metadata]);
    const [pickingToken, setPickingToken] = useState<boolean>(false);
    const addToast = useSetAtom(addToastAtom);
    const chainParameters = useBlockChainParameters();
    const currentAmount = form.watch('amount');

    if (!address || !selectedCred) {
        throw new Error('Missing selected accoount');
    }

    const [contractBalances] = useAtom(contractBalancesFamily(address, chosenToken?.contractIndex || ''));
    const decimals = getMetadataDecimals(tokenMetadata);

    const accountInfo = useAccountInfo(selectedCred);

    const ccdBalance = getPublicAccountAmounts(accountInfo).atDisposal;
    const currentBalance = useMemo(() => {
        if (!chosenToken) {
            return ccdBalance;
        }
        return contractBalances[chosenToken.tokenId];
    }, [chosenToken, ccdBalance]);

    const validateAmount: Validate<string> = (amount) =>
        validateTransferAmount(amount, currentBalance, decimals, chosenToken ? 0n : cost);

    const maxValue = useMemo(() => {
        if (currentBalance !== undefined) {
            return chosenToken ? currentBalance : max(0n, currentBalance - cost);
        }
        return undefined;
    }, [Boolean(chosenToken), currentBalance, cost]);

    const fee = useAsyncMemo<FeeResult>(
        async () => {
            if (chosenToken) {
                if (validateAccountAddress(recipient)) {
                    return undefined;
                }
                const amount =
                    validateAmount(currentAmount) === undefined
                        ? fractionalToInteger(currentAmount, decimals)
                        : undefined;
                try {
                    const energy = await getTokenTransferEnergy(
                        client,
                        address,
                        recipient,
                        chosenToken.tokenId,
                        amount || maxValue || 1n,
                        BigInt(chosenToken.contractIndex)
                    );
                    form.setValue('executionEnergy', energy.execution.toString());
                    return { success: true, value: energy.total };
                } catch (e) {
                    addToast(t('sendCcd.transferInvokeFailed', { message: (e as Error).message }));
                    return { success: false };
                }
            }
            return { success: true, value: Energy.create(SIMPLE_TRANSFER_ENERGY_TOTAL_COST) };
        },
        undefined,
        [chosenToken?.contractIndex, chosenToken?.tokenId, recipient, currentAmount]
    );

    useEffect(() => {
        setCost(
            chainParameters && fee?.success ? convertEnergyToMicroCcd(fee.value, chainParameters).microCcdAmount : 0n
        );
    }, [fee, chainParameters]);

    useEffect(() => {
        // When switching account reset whether or not the user is picking a token.
        setPickingToken(false);

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

    useEffect(() => {
        setDetailsExpanded(true);
    }, []);

    const validateRecipient = useCallback<Validate<string>>(async (recipientAddress: string) => {
        if (!recipientAddress) {
            return undefined;
        }
        const validateAddress = validateAccountAddress(recipientAddress);
        if (validateAddress) {
            return validateAddress;
        }
        try {
            await client.getAccountInfo(AccountAddress.fromBase58(recipientAddress));
            return undefined;
        } catch {
            return t('sendCcd.nonexistingAccount');
        }
    }, []);

    const displayAmount = integerToFractional(decimals);

    const onMax = () => {
        form.setValue('amount', displayAmount(maxValue) || '0');
    };

    if (maxValue === undefined) {
        return null;
    }

    const onSubmit: SubmitHandler<CreateTransferFormValues> = (vs) => {
        const nextRoute = getNextRoute(vs.token);
        const currentState = buildConfirmState(vs);

        nav(pathname, { state: currentState, replace: true }); // Ensures next route can move back to UI with previous values.
        nav(nextRoute, { state: currentState });
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
                            validate: validateRecipient,
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
                        {tShared('continue')}
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
