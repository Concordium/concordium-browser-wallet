import React from 'react';
import { Location, Navigate, useLocation, useNavigate, useParams } from 'react-router-dom';

import CheckCircle from '@assets/svgX/check-circle.svg';
import Cross from '@assets/svgX/close.svg';
import Arrow from '@assets/svgX/arrow-right.svg';
import Button from '@popup/popupX/shared/Button';
import Page from '@popup/popupX/shared/Page';
import { absoluteRoutes, transactionDetailsRoute } from '@popup/popupX/constants/routes';
import Card from '@popup/popupX/shared/Card';
import { useAsyncMemo } from 'wallet-common-helpers';
import {
    AccountTransactionPayload,
    AccountTransactionSummary,
    AccountTransactionType,
    BaseAccountTransactionSummary,
    CcdAmount,
    ConfigureBakerPayload,
    ConfigureDelegationPayload,
    FailedTransactionSummary,
    HexString,
    isRejectTransaction,
    isSuccessTransaction,
    SimpleTransferPayload,
    SimpleTransferWithMemoPayload,
    TransactionHash,
    TransactionSummaryType,
} from '@concordium/web-sdk';
import { useAtomValue } from 'jotai';
import { grpcClientAtom } from '@popup/store/settings';
import { formatCcdAmount } from '@popup/popupX/shared/utils/helpers';
import { LoaderInline } from '@popup/popupX/shared/Loader';
import { useTranslation } from 'react-i18next';
import Text from '@popup/popupX/shared/Text';

const TX_TIMEOUT = 60 * 1000; // 1 minute

export type SubmittedTransactionLocationState = {
    transactionType: AccountTransactionType;
    payload: AccountTransactionPayload;
    fee?: CcdAmount.Type;
};

type DelegationBodyProps = {
    success: boolean | undefined;
    payload: ConfigureBakerPayload;
};

function DelegationBody({ success, payload }: DelegationBodyProps) {
    const { t } = useTranslation('x', { keyPrefix: 'submittedTransaction.configureDelegation' });

    if (payload.stake?.microCcdAmount === 0n) {
        return (
            <Text.Capture>
                {success === true && t('removed')}
                {success === false && t('error')}
            </Text.Capture>
        );
    }

    if (payload.stake !== undefined) {
        return (
            <>
                <Text.Capture>
                    {success === true && t('changeStake')}
                    {success === false && t('error')}
                </Text.Capture>
                <Text.HeadingLarge>{formatCcdAmount(payload.stake)}</Text.HeadingLarge>
                <Text.Capture>CCD</Text.Capture>
            </>
        );
    }

    return (
        <Text.Capture>
            {success === true && t('updated')}
            {success === false && t('error')}
        </Text.Capture>
    );
}

type ValidatorBodyProps = {
    success: boolean | undefined;
    payload: ConfigureDelegationPayload;
};

function ValidatorBody({ success, payload }: ValidatorBodyProps) {
    const { t } = useTranslation('x', { keyPrefix: 'submittedTransaction.configureValidator' });

    if (payload.stake?.microCcdAmount === 0n) {
        return (
            <Text.Capture>
                {success === true && t('removed')}
                {success === false && t('error')}
            </Text.Capture>
        );
    }

    if (payload.stake !== undefined) {
        return (
            <>
                <Text.Capture>
                    {success === true && t('changeStake')}
                    {success === false && t('error')}
                </Text.Capture>
                <Text.HeadingLarge>{formatCcdAmount(payload.stake)}</Text.HeadingLarge>
                <Text.Capture>CCD</Text.Capture>
            </>
        );
    }

    return (
        <Text.Capture>
            {success === true && t('updated')}
            {success === false && t('error')}
        </Text.Capture>
    );
}

type TransferBodyProps = {
    fee?: CcdAmount.Type;
    payload: SimpleTransferPayload;
};

function TransferBody({ payload, fee }: TransferBodyProps) {
    const { t } = useTranslation('x', { keyPrefix: 'submittedTransaction.transfer' });
    return (
        <>
            <Text.Capture>{t('amountCcd')}</Text.Capture>
            <Text.HeadingLarge>{formatCcdAmount(payload.amount)}</Text.HeadingLarge>
            {fee && <Text.Capture>{t('estimatedFee', { fee: formatCcdAmount(fee) })}</Text.Capture>}
        </>
    );
}

export type CIS2TransferSubmittedLocationState = {
    transactionType: AccountTransactionType.Update;
    updateType: 'cis2.transfer';
    // To avoid getting token metadata again, we re-use the values from the previous view.
    /** formatted amount */
    amount: string;
    tokenName: string;
};

export type CIS4RevokeSubmittedLocationState = {
    transactionType: AccountTransactionType.Update;
    updateType: 'cis4.revoke';
};

type UpdateContractSubmittedLocationState = CIS2TransferSubmittedLocationState | CIS4RevokeSubmittedLocationState;

type UpdateContractBodyProps = {
    success: boolean | undefined;
};

function UpdateContractBody({ success }: UpdateContractBodyProps) {
    const { t } = useTranslation('x', { keyPrefix: 'submittedTransaction' });
    const { state } = useLocation() as Location & { state: UpdateContractSubmittedLocationState };
    switch (state.updateType) {
        case 'cis2.transfer':
            return (
                <>
                    <Text.Capture>
                        {success === true && t('transfer.success')}
                        {success === false && t('transfer.error')}
                    </Text.Capture>
                    <Text.HeadingLarge>{state.amount}</Text.HeadingLarge>
                    <Text.Capture>{state.tokenName}</Text.Capture>
                </>
            );
        case 'cis4.revoke':
            return (
                <Text.Capture>
                    {success === true && t('web3Revoke.success')}
                    {success === false && t('web3Revoke.error')}
                </Text.Capture>
            );
        default:
            throw new Error('Unsupported');
    }
}

type SuccessSummary = Exclude<AccountTransactionSummary, FailedTransactionSummary>;
type FailureSummary = BaseAccountTransactionSummary & FailedTransactionSummary;

type TransactionStatusProps = {
    success?: boolean | undefined;
};

function TransactionStatus({ success }: TransactionStatusProps) {
    const { state } = useLocation() as Location & { state: SubmittedTransactionLocationState };
    const { t } = useTranslation('x', { keyPrefix: 'submittedTransaction' });

    let icon: JSX.Element;
    switch (success) {
        case undefined: {
            icon = <LoaderInline />;
            break;
        }
        case true: {
            icon = <CheckCircle />;
            break;
        }
        case false: {
            icon = <Cross className="submitted-tx__failed-icon" />;
            break;
        }
        default:
            throw new Error('Unexpected status');
    }

    if (!state) {
        // Fall back to show generic transaction status message
        return (
            <>
                {icon}
                {success === true && <Text.Capture>{t('success.label')}</Text.Capture>}
                {success === false && <Text.Capture>{t('failure.label')}</Text.Capture>}
                {success === undefined && <Text.Capture>{t('pending.label')}</Text.Capture>}
            </>
        );
    }

    return (
        <>
            {icon}
            {/* Each individual body handles success/failure */}
            {state.transactionType === AccountTransactionType.Transfer && (
                <TransferBody fee={state.fee} payload={state.payload as SimpleTransferPayload} />
            )}
            {state.transactionType === AccountTransactionType.TransferWithMemo && (
                <TransferBody fee={state.fee} payload={state.payload as SimpleTransferWithMemoPayload} />
            )}
            {state.transactionType === AccountTransactionType.ConfigureDelegation && (
                <DelegationBody success={success} payload={state.payload as ConfigureDelegationPayload} />
            )}
            {state.transactionType === AccountTransactionType.ConfigureBaker && (
                <ValidatorBody success={success} payload={state.payload as ConfigureBakerPayload} />
            )}
            {state.transactionType === AccountTransactionType.Update && <UpdateContractBody success={success} />}
        </>
    );
}

type FailureProps = {
    message: string;
};

function Failure({ message }: FailureProps) {
    return (
        <>
            <Cross className="submitted-tx__failed-icon" />
            <Text.Capture>{message}</Text.Capture>
        </>
    );
}

type Status =
    | { type: 'success'; summary: SuccessSummary }
    | { type: 'failure'; summary: FailureSummary }
    | { type: 'error'; message: string };

export type SubmittedTransactionParams = {
    /** The transaction to show the status for */
    transactionHash: HexString;
};

/** Component displaying the status of a submitted transaction. Must be given a transaction hash as a route parameter */
export default function SubmittedTransaction() {
    const { t } = useTranslation('x', { keyPrefix: 'submittedTransaction' });
    const { transactionHash } = useParams<SubmittedTransactionParams>();
    const nav = useNavigate();
    const grpc = useAtomValue(grpcClientAtom);

    const status = useAsyncMemo(
        async (): Promise<Status> => {
            if (transactionHash === undefined) {
                throw new Error('Transaction not specified in url');
            }

            try {
                const outcome = await grpc.waitForTransactionFinalization(
                    TransactionHash.fromHexString(transactionHash),
                    TX_TIMEOUT
                );

                if (!outcome.summary) {
                    throw Error('Unexpected transaction type');
                }
                if (isRejectTransaction(outcome.summary)) {
                    return { type: 'failure', summary: outcome.summary };
                }
                if (
                    isSuccessTransaction(outcome.summary) &&
                    outcome.summary.type === TransactionSummaryType.AccountTransaction
                ) {
                    return { type: 'success', summary: outcome.summary };
                }

                throw Error('Unexpected transaction type');
            } catch (e) {
                return { type: 'error', message: (e as Error).message ?? `${e}` };
            }
        },
        undefined,
        [transactionHash, grpc]
    );

    if (transactionHash === undefined) {
        return <Navigate to={absoluteRoutes.home.path} />;
    }

    return (
        <Page className="submitted-tx">
            <Card type="transparent" className="submitted-tx__card">
                {status?.type === undefined && <TransactionStatus />}
                {status?.type === 'success' && <TransactionStatus success />}
                {status?.type === 'failure' && <TransactionStatus success={false} />}
                {status?.type === 'error' && <Failure message={status.message} />}
            </Card>
            {status?.type !== undefined && status.type !== 'error' && (
                <Button.IconText
                    icon={<Arrow />}
                    label={t('detailsButton')}
                    className="submitted-tx__details-btn"
                    leftLabel
                    onClick={() => nav(transactionDetailsRoute(status.summary.sender, status.summary.hash))}
                />
            )}
            <Page.Footer>
                <Button.Main onClick={() => nav(absoluteRoutes.home.path)} label={t('continue')} />
            </Page.Footer>
        </Page>
    );
}
