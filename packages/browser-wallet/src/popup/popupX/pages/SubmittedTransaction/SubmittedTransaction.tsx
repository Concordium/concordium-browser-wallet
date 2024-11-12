import React from 'react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';

import CheckCircle from '@assets/svgX/check-circle.svg';
import Cross from '@assets/svgX/close.svg';
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
    ConfigureBakerSummary,
    BakerStakeChangedEvent,
    BakerEvent,
} from '@concordium/web-sdk';
import { useAtomValue } from 'jotai';
import { grpcClientAtom } from '@popup/store/settings';
import { formatCcdAmount } from '@popup/popupX/shared/utils/helpers';
import { LoaderInline } from '@popup/popupX/shared/Loader';
import { useTranslation } from 'react-i18next';
import Text from '@popup/popupX/shared/Text';

const TX_TIMEOUT = 60 * 1000; // 1 minute

type DelegationBodyProps = BaseAccountTransactionSummary & ConfigureDelegationSummary;

function DelegationBody({ events }: DelegationBodyProps) {
    const { t } = useTranslation('x', { keyPrefix: 'submittedTransaction.success.configureDelegation' });
    const stakeChange = events.find((e) =>
        [TransactionEventTag.DelegationStakeIncreased, TransactionEventTag.DelegationStakeDecreased].includes(e.tag)
    ) as DelegationStakeChangedEvent | undefined;

    if (stakeChange !== undefined) {
        return (
            <>
                <Text.Capture>{t('changeStake')}</Text.Capture>
                <Text.HeadingLarge>{formatCcdAmount(stakeChange.newStake)}</Text.HeadingLarge>
                <Text.Capture>CCD</Text.Capture>
            </>
        );
    }

    const removal = events.find((e) => [TransactionEventTag.DelegationRemoved].includes(e.tag)) as
        | DelegatorEvent
        | undefined;

    if (removal !== undefined) {
        return <Text.Capture>{t('removed')}</Text.Capture>;
    }

    return <Text.Capture>{t('updated')}</Text.Capture>;
}

type ValidatorBodyProps = BaseAccountTransactionSummary & ConfigureBakerSummary;

function ValidatorBody({ events }: ValidatorBodyProps) {
    const { t } = useTranslation('x', { keyPrefix: 'submittedTransaction.success.configureValidator' });

    const stakeChange = events.find((e) =>
        [TransactionEventTag.BakerStakeIncreased, TransactionEventTag.BakerStakeDecreased].includes(e.tag)
    ) as BakerStakeChangedEvent | undefined;
    if (stakeChange !== undefined) {
        return (
            <>
                <Text.Capture>{t('changeStake')}</Text.Capture>
                <Text.HeadingLarge>{formatCcdAmount(stakeChange.newStake)}</Text.HeadingLarge>
                <Text.Capture>CCD</Text.Capture>
            </>
        );
    }

    const removal = events.find((e) => [TransactionEventTag.BakerRemoved].includes(e.tag)) as BakerEvent | undefined;
    if (removal !== undefined) {
        return <Text.Capture>{t('removed')}</Text.Capture>;
    }

    return <Text.Capture>{t('updated')}</Text.Capture>;
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

function Success({ tx }: SuccessProps) {
    const { t } = useTranslation('x', { keyPrefix: 'submittedTransaction' });
    return (
        <>
            <CheckCircle />
            {tx.transactionType === TransactionKindString.Transfer && (
                <>
                    <Text.Capture>{t('success.transfer.label')}</Text.Capture>
                    <Text.HeadingLarge>{formatCcdAmount(tx.transfer.amount)}</Text.HeadingLarge>
                    <Text.Capture>CCD</Text.Capture>
                </>
            )}
            {tx.transactionType === TransactionKindString.ConfigureDelegation && <DelegationBody {...tx} />}
            {tx.transactionType === TransactionKindString.ConfigureBaker && <ValidatorBody {...tx} />}
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

function Finalizing() {
    const { t } = useTranslation('x', { keyPrefix: 'submittedTransaction' });
    return (
        <>
            <LoaderInline />
            <Text.Capture>{t('pending.label')}</Text.Capture>
        </>
    );
}

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
                {status === undefined && <Finalizing />}
                {status?.type === 'success' && <Success tx={status.summary} />}
                {status?.type === 'failure' && (
                    <Failure message={t('failure.label', { reason: status.summary.rejectReason.tag })} />
                )}
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
                <Button.Main
                    className="button-main"
                    onClick={() => nav(absoluteRoutes.home.path)}
                    label={t('continue')}
                />
            </Page.Footer>
        </Page>
    );
}
