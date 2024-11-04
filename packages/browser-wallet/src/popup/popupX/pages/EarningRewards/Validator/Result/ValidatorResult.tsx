import React, { useCallback, useMemo } from 'react';
import {
    AccountAddress,
    AccountInfoBaker,
    AccountTransactionPayload,
    AccountTransactionType,
    CcdAmount,
    ConfigureBakerPayload,
    TransactionHash,
} from '@concordium/web-sdk';
import { Navigate, useLocation, Location, useNavigate } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { useTranslation } from 'react-i18next';
import { useUpdateAtom } from 'jotai/utils';

import Button from '@popup/popupX/shared/Button';
import Page from '@popup/popupX/shared/Page';
import { formatCcdAmount } from '@popup/popupX/shared/utils/helpers';
import Card from '@popup/popupX/shared/Card';
import { ensureDefined } from '@shared/utils/basic-helpers';
import { useBlockChainParametersAboveV0 } from '@popup/shared/BlockChainParametersProvider';
import { secondsToDaysRoundedDown } from '@shared/utils/time-helpers';
import { grpcClientAtom } from '@popup/store/settings';
import { usePrivateKey } from '@popup/shared/utils/account-helpers';
import {
    createPendingTransactionFromAccountTransaction,
    getDefaultExpiry,
    getTransactionAmount,
    sendTransaction,
    useGetTransactionFee,
} from '@popup/shared/utils/transaction-helpers';
import { addPendingTransactionAtom } from '@popup/store/transactions';
import { cpStakingCooldown } from '@shared/utils/chain-parameters-helpers';
import { submittedTransactionRoute } from '@popup/popupX/constants/routes';
import Text from '@popup/popupX/shared/Text';
import { useSelectedAccountInfo } from '@popup/shared/AccountInfoListenerContext/AccountInfoListenerContext';
import { showValidatorAmount, showValidatorOpenStatus, showValidatorRestake } from '../util';

enum TransactionSubmitErrorType {
    InsufficientFunds = 'InsufficientFunds',
}

class TransactionSubmitError extends Error {
    private constructor(public type: TransactionSubmitErrorType) {
        super();
        super.name = `TransactionSubmitError.${type}`;
    }

    public static insufficientFunds(): TransactionSubmitError {
        return new TransactionSubmitError(TransactionSubmitErrorType.InsufficientFunds);
    }
}

function useTransactionSubmit(sender: AccountAddress.Type, type: AccountTransactionType) {
    const grpc = useAtomValue(grpcClientAtom);
    const key = usePrivateKey(sender.address);
    const addPendingTransaction = useUpdateAtom(addPendingTransactionAtom);

    return useCallback(
        async (payload: AccountTransactionPayload, cost: CcdAmount.Type) => {
            const accountInfo = await grpc.getAccountInfo(sender);
            if (
                accountInfo.accountAvailableBalance.microCcdAmount <
                getTransactionAmount(type, payload) + (cost.microCcdAmount || 0n)
            ) {
                throw TransactionSubmitError.insufficientFunds();
            }

            const nonce = await grpc.getNextAccountNonce(sender);

            const header = {
                expiry: getDefaultExpiry(),
                sender,
                nonce: nonce.nonce,
            };
            const transaction = { payload, header, type };

            const hash = await sendTransaction(grpc, transaction, key!);
            const pending = createPendingTransactionFromAccountTransaction(transaction, hash, cost.microCcdAmount);
            await addPendingTransaction(pending);

            return hash;
        },
        [key]
    );
}

export type ValidationResultLocationState = {
    payload: ConfigureBakerPayload;
    type: 'register' | 'change' | 'remove';
};

export default function DelegationResult() {
    const { state } = useLocation() as Location & {
        state: ValidationResultLocationState | undefined;
    };
    const nav = useNavigate();
    const { t } = useTranslation('x', { keyPrefix: 'earn.validator' });
    const getCost = useGetTransactionFee(AccountTransactionType.ConfigureBaker);
    const accountInfo = ensureDefined(useSelectedAccountInfo(), 'No account selected');

    const parametersV1 = useBlockChainParametersAboveV0();
    const submitTransaction = useTransactionSubmit(accountInfo.accountAddress, AccountTransactionType.ConfigureBaker);

    const cooldown = useMemo(() => {
        let cooldownParam = 0n;
        if (parametersV1 !== undefined) {
            cooldownParam = cpStakingCooldown(parametersV1);
        }
        return secondsToDaysRoundedDown(cooldownParam);
    }, [parametersV1]);

    const [title, notice] = useMemo(() => {
        switch (state?.type) {
            case 'register':
                return [t('register.title'), t('register.notice', { cooldown })];
            case 'change':
                if (
                    state.payload.stake === undefined ||
                    state.payload.stake.microCcdAmount >=
                        (accountInfo as AccountInfoBaker).accountBaker.stakedAmount.microCcdAmount
                ) {
                    // Staked amount is not lowered
                    return [t('update.title')];
                }
                return [t('update.title'), t('update.lowerStakeNotice', { cooldown })];
            case 'remove':
                return [t('remove.title'), t('remove.notice', { cooldown })];
            default:
                throw new Error("'type' must be defined on route state");
        }
    }, [state, t, cooldown]);

    if (state === undefined) {
        return <Navigate to=".." />;
    }

    const fee = getCost(state.payload);
    const submit = async () => {
        if (fee === undefined) {
            throw Error('Fee could not be calculated');
        }
        const tx = await submitTransaction(state.payload, fee);
        nav(submittedTransactionRoute(TransactionHash.fromHexString(tx)));
    };

    // TODO:
    // - Add the rest of the transaction fields
    return (
        <Page className="validation-result-container">
            <Page.Top heading={title} />
            {notice !== undefined && <Text.Capture>{notice}</Text.Capture>}
            <Card className="validation-result__card">
                <Card.Row>
                    <Card.RowDetails title={t('submit.sender.label')} value={accountInfo.accountAddress.address} />
                </Card.Row>
                {state.payload.stake !== undefined && (
                    <Card.Row>
                        <Card.RowDetails
                            title={t('values.amount.label')}
                            value={showValidatorAmount(state.payload.stake)}
                        />
                    </Card.Row>
                )}
                {state.payload.restakeEarnings !== undefined && (
                    <Card.Row>
                        <Card.RowDetails
                            title={t('values.restake.label')}
                            value={showValidatorRestake(state.payload.restakeEarnings)}
                        />
                    </Card.Row>
                )}
                {state.payload.openForDelegation !== undefined && (
                    <Card.Row>
                        <Card.RowDetails
                            title={t('values.restake.label')}
                            value={showValidatorOpenStatus(state.payload.openForDelegation)}
                        />
                    </Card.Row>
                )}
                <Card.Row>
                    <Card.RowDetails
                        title={t('submit.fee.label')}
                        value={`${fee !== undefined ? formatCcdAmount(fee) : '...'} CCD`}
                    />
                </Card.Row>
            </Card>
            <Page.Footer>
                <Button.Main onClick={submit} label={t('submit.button')} className="m-t-20" />
            </Page.Footer>
        </Page>
    );
}
