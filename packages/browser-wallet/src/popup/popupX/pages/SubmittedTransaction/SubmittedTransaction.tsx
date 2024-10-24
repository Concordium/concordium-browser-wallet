import React, { useMemo } from 'react';
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
} from '@concordium/web-sdk';
import { useAtomValue } from 'jotai';
import { grpcClientAtom } from '@popup/store/settings';

const TX_TIMEOUT = 60 * 1000; // 1 minute

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
    const body = useMemo(() => {
        switch (tx.transactionType) {
            case TransactionKindString.Transfer: {
                return (
                    <>
                        <span className="capture__main_small">You’ve sent</span>
                        <span className="heading_large">12,600.00</span>
                        <span className="capture__main_small">CCD</span>
                    </>
                );
            }
            default:
                throw new Error(`${tx.transactionType} transactions are not supported`);
        }
    }, [tx]);

    return (
        <>
            <CheckCircle />
            {body}
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
    txHash: HexString;
};

export default function SubmittedTransaction() {
    const { txHash } = useParams<SubmittedTransactionParams>();
    const nav = useNavigate();
    const grpc = useAtomValue(grpcClientAtom);

    const status = useAsyncMemo(
        async (): Promise<Status> => {
            if (txHash === undefined) {
                throw new Error('Transaction not specified in url');
            }

            try {
                const outcome = await grpc.waitForTransactionFinalization(
                    TransactionHash.fromHexString(txHash),
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
        [txHash, grpc]
    );

    if (txHash === undefined) {
        return <Navigate to={absoluteRoutes.home.path} />;
    }

    // FIXME:
    // 1. translations...
    return (
        <Page>
            <Card type="transparent">
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
