import React, { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtomValue, useSetAtom } from 'jotai';
import { AccountTokens, selectedAccountAtom, Tokens, tokensAtom } from '@popup/store/account';
import Form from '@popup/shared/Form';
import AmountInput from '@popup/shared/Form/CcdInput';
import Input from '@popup/shared/Form/Input';
import {
    ccdToMicroCcd,
    getPublicAccountAmounts,
    fractionalToInteger,
    useAsyncMemo,
    integerToFractional,
    max,
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
import { CCD_METADATA, getTokenBalance, getTokenTransferEnergy, TokenIdentifier } from '@shared/utils/token-helpers';
import { jsonRpcClientAtom } from '@popup/store/settings';
import { addToastAtom } from '@popup/state';
import ErrorMessage from '@popup/shared/Form/ErrorMessage';
import clsx from 'clsx';
import { routes } from './routes';
import DisplayToken from './DisplayToken';
import PickToken from './PickToken';

export type FormValues = {
    amount: string;
    recipient: string;
    executionEnergy: string;
    token?: TokenIdentifier;
};

interface Props {
    exchangeRate?: number;
    setCost: (cost: bigint) => void;
}

type State = undefined | (SimpleTransferPayload & Partial<TokenIdentifier>);

function createDefaultValues(defaultPayload: State, accountTokens?: AccountTokens) {
    let token;
    let decimals = 6;
    if (defaultPayload?.contractIndex) {
        const metadata = accountTokens?.[defaultPayload.contractIndex]?.find(
            (t) => t.id === defaultPayload.tokenId
        )?.metadata;
        token = { contractIndex: defaultPayload.contractIndex, tokenId: defaultPayload.tokenId, metadata };
        decimals = metadata?.decimals || 0;
    }
    return {
        amount: integerToFractional(decimals)(defaultPayload?.amount.microGtuAmount),
        recipient: defaultPayload?.toAddress.address,
        token,
    };
}

function CreateTransaction({ exchangeRate, tokens, setCost }: Props & { tokens: Tokens }) {
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

    const fee = useAsyncMemo(
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
                    return energy.total;
                } catch {
                    return undefined;
                }
            }
            return 501n;
        },
        undefined,
        [chosenToken?.contractIndex, chosenToken?.tokenId, recipient]
    );

    const cost = useMemo(() => {
        const newCost = exchangeRate && fee ? BigInt(Math.ceil(exchangeRate * Number(fee))) : 0n;
        setCost(newCost);
        return newCost;
    }, [fee, exchangeRate]);

    const accountInfo = useAccountInfo(selectedCred);

    const ccdBalance = getPublicAccountAmounts(accountInfo).atDisposal;
    const currentBalance = useAsyncMemo(
        () => {
            if (!chosenToken) {
                return Promise.resolve(ccdBalance);
            }
            return getTokenBalance(client, address, chosenToken);
        },
        (e) => {
            addToast(e.message);
        },
        [chosenToken, accountInfo?.accountAmount]
    );

    const validateAmount: Validate<string> = (amount) =>
        validateTransferAmount(amount, currentBalance, tokenMetadata.decimals, chosenToken ? 0n : cost);

    const maxValue = useMemo(() => {
        if (currentBalance !== undefined) {
            return chosenToken ? currentBalance : max(0n, currentBalance - cost);
        }
        return undefined;
    }, [Boolean(chosenToken), currentBalance, cost]);

    useEffect(() => {
        // Reset chosen token if the current account is changed
        // TODO: change only if new account does not have chosen token/reset to initial token.
        return () => form.setValue('token', undefined);
    }, [address]);

    useEffect(() => {
        // Reset amount if the token is changed
        return () => form.setValue('amount', '');
    }, [chosenToken?.contractIndex, chosenToken?.tokenId]);

    const displayAmount = integerToFractional(tokenMetadata.decimals || 0);

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
                fractionalToInteger(vs.amount, vs.token.metadata.decimals || 0)
            );
            nav(routes.confirmToken, { state: { ...payload, ...vs.token, executionEnergy: vs.executionEnergy } });
        } else {
            const payload = buildSimpleTransferPayload(vs.recipient, ccdToMicroCcd(vs.amount));
            nav(routes.confirm, { state: { ...payload } });
        }
    };

    const canCoverCost = ccdBalance - cost > 0;

    if (pickingToken) {
        return (
            <PickToken
                tokens={accountTokens}
                onClick={(chosen: TokenIdentifier | undefined) => {
                    setPickingToken(false);
                    form.setValue('token', chosen);
                }}
                ccdBalance={ccdBalance}
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
                    <div
                        className={clsx(
                            'create-transfer__token-picker',
                            !canCoverCost && 'create-transfer__token-picker-error'
                        )}
                    >
                        <DisplayToken
                            metadata={tokenMetadata}
                            balance={currentBalance}
                            disabled={!accountTokens}
                            onClick={() => setPickingToken(true)}
                            className="w-full"
                        />
                        {!canCoverCost && (
                            <ErrorMessage className="form-input__error w-full">
                                {t('sendCcd.unableToCoverCost')}
                            </ErrorMessage>
                        )}
                    </div>
                    <AmountInput
                        register={f.register}
                        name="amount"
                        symbol={tokenMetadata.symbol || ''}
                        label={t('sendCcd.labels.ccd')}
                        className="create-transfer__input"
                        onMax={onMax}
                        rules={{
                            required: tShared('utils.ccdAmount.required'),
                            validate: validateAmount as Validate<unknown>,
                        }}
                    />
                    <Input
                        register={f.register}
                        name="recipient"
                        label={t('sendCcd.labels.recipient')}
                        className="create-transfer__input"
                        rules={{
                            required: tShared('utils.address.required'),
                            validate: validateAccountAddress as Validate<unknown>,
                        }}
                    />
                    <DisplayCost className="create-transfer__cost" cost={cost} />

                    <Submit className="create-transfer__button" width="medium">
                        {t('sendCcd.buttons.continue')}
                    </Submit>
                </>
            )}
        </Form>
    );
}

export default function loadingTokensGuard({ ...props }: Props) {
    const tokens = useAtomValue(tokensAtom);
    if (tokens.loading) {
        return null;
    }
    return <CreateTransaction tokens={tokens.value} {...props} />;
}
