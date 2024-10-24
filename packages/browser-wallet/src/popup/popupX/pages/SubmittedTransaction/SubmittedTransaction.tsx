import React from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import CheckCircle from '@assets/svgX/check-circle.svg';
import Arrow from '@assets/svgX/arrow-right.svg';
import Button from '@popup/popupX/shared/Button';
import Page from '@popup/popupX/shared/Page';
import { absoluteRoutes, transactionDetailsRoute } from '@popup/popupX/constants/routes';
import Card from '@popup/popupX/shared/Card';
import { useAsyncMemo } from 'wallet-common-helpers';
import {
    AccountTransactionSummary,
    HexString,
    TransactionHash,
    TransactionSummaryType,
    isRejectTransaction,
    isSuccessTransaction,
    TransactionKindString,
    FailedTransactionSummary,
    BaseAccountTransactionSummary,
    TransactionEventTag,
    DelegationStakeChangedEvent,
    DelegatorEvent,
    ConfigureDelegationSummary,
} from '@concordium/web-sdk';
import { useAtomValue } from 'jotai';
import { grpcClientAtom } from '@popup/store/settings';
import { formatCcdAmount } from '@popup/popupX/shared/utils/helpers';

const TX_TIMEOUT = 60 * 1000; // 1 minute

type DelegationBodyProps = BaseAccountTransactionSummary & ConfigureDelegationSummary;

function DelegationBody({ events }: DelegationBodyProps) {
    const stakeChange = events.find((e) =>
        [TransactionEventTag.DelegationStakeIncreased, TransactionEventTag.DelegationStakeDecreased].includes(e.tag)
    ) as DelegationStakeChangedEvent | undefined;

    if (stakeChange !== undefined) {
        return (
            <>
                <span className="capture__main_small">You’ve delegated</span>
                <span className="heading_large">{formatCcdAmount(stakeChange.newStake)}</span>
                <span className="capture__main_small">CCD</span>
            </>
        );
    }

    const removal = events.find((e) => [TransactionEventTag.DelegationRemoved].includes(e.tag)) as
        | DelegatorEvent
        | undefined;

    if (removal !== undefined) {
        return <span className="capture__main_small">You’ve removed your delegated stake</span>;
    }

    return <span className="capture__main_small">You’ve updated your delegation settings</span>;
}

type SuccessSummary = Exclude<AccountTransactionSummary, FailedTransactionSummary>;
type FailureSummary = BaseAccountTransactionSummary & FailedTransactionSummary;

type Status =
    | { type: 'success'; summary: SuccessSummary }
    | { type: 'failure'; summary: FailureSummary }
    | { type: 'error'; message: string };

type SuccessProps = {
    tx: SuccessSummary;
};

// TODO:
// 1. Handle delegation transaction case
function Success({ tx }: SuccessProps) {
    return (
        <>
            <CheckCircle />
            {tx.transactionType === TransactionKindString.Transfer && (
                <>
                    <span className="capture__main_small">You’ve sent</span>
                    <span className="heading_large">12,600.00</span>
                    <span className="capture__main_small">CCD</span>
                </>
            )}
            {tx.transactionType === TransactionKindString.ConfigureDelegation && <DelegationBody {...tx} />}
        </>
    );
}
type FailureProps = {
    message: string;
};

// TODO:
// 1. Proper error icon
function Failure({ message }: FailureProps) {
    return (
        <>
            <CheckCircle />
            <span className="capture__main_small">{message}</span>
        </>
    );
}

// TODO:
// 1. Proper error icon
function Finalizing() {
    return (
        <>
            <CheckCircle />
            <span className="capture__main_small">Finalizing on chain</span>
        </>
    );
}

export type SubmittedTransactionParams = {
    /** The transaction to show the status for */
    transactionHash: HexString;
};

export default function SubmittedTransaction() {
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

    // FIXME:
    // 1. translations...
    return (
        <Page className="submitted-tx">
            <Card type="transparent" className="submitted-tx__card">
                {status === undefined && <Finalizing />}
                {status?.type === 'success' && <Success tx={status.summary} />}
                {status?.type === 'failure' && (
                    <Failure message={`The transaction failed: ${status.summary.rejectReason.tag}`} />
                )}
                {status?.type === 'error' && <Failure message={status.message} />}
            </Card>
            {status?.type !== undefined && status.type !== 'error' && (
                <Button.IconText
                    icon={<Arrow />}
                    label="Transaction details"
                    className="submitted-tx__details-btn"
                    leftLabel
                    onClick={() => nav(transactionDetailsRoute(status.summary.sender, status.summary.hash))}
                />
            )}
            <Page.Footer>
                <Button.Main
                    className="button-main"
                    onClick={() => nav(absoluteRoutes.home.path)}
                    label="Return to Account"
                />
            </Page.Footer>
        </Page>
    );
}
