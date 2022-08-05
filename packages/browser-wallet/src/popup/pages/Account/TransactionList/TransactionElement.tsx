import SidedRow from '@popup/shared/SidedRow';
import React, { CSSProperties } from 'react';
import DoubleCheckmarkIcon from '@assets/svg/double-grey-checkmark.svg';
import Warning from '@assets/svg/warning.svg';
import { displayAsCcd } from 'wallet-common-helpers/lib/utils/ccd';
import {
    BrowserWalletTransaction,
    TransactionStatus,
    TransactionType,
} from '@popup/shared/utils/transaction-history-types';
import { dateFromTimestamp, TimeStampUnit } from 'wallet-common-helpers';
import clsx from 'clsx';

export const transactionElementHeight = 58;

interface Props {
    transaction: BrowserWalletTransaction;
    style: CSSProperties;
    accountAddress: string;
}

const onlyTime = Intl.DateTimeFormat(undefined, {
    timeStyle: 'medium',
    hourCycle: 'h23',
}).format;

function statusIcon(status: TransactionStatus) {
    switch (status) {
        case TransactionStatus.Failed:
        case TransactionStatus.Finalized:
            return <DoubleCheckmarkIcon className="transaction-element__checkmark" />;
        default:
            throw new Error(`Received an unsupported status: ${status}`);
    }
}

function isOutgoingTransaction(transaction: BrowserWalletTransaction, accountAddress: string) {
    return transaction.fromAddress === accountAddress;
}

function isEncryptedTransfer(transaction: BrowserWalletTransaction) {
    return [TransactionType.EncryptedAmountTransfer, TransactionType.EncryptedAmountTransferWithMemo].includes(
        transaction.type
    );
}

function isTransferTransaction(type: TransactionType) {
    switch (type) {
        case TransactionType.Transfer:
        case TransactionType.TransferWithMemo:
        case TransactionType.TransferToEncrypted:
        case TransactionType.TransferToPublic:
        case TransactionType.TransferWithSchedule:
        case TransactionType.TransferWithScheduleAndMemo:
        case TransactionType.EncryptedAmountTransfer:
        case TransactionType.EncryptedAmountTransferWithMemo:
            return true;
        default:
            return false;
    }
}

/**
 * Constructs a displayable string of the fee for a transaction.
 * @param cost the transaction cost
 * @param accountAddress the account to derive the fee string for
 * @param transaction the transaction to calculate the fee for
 * @returns a displayable string of the fee for a transaction in CCD.
 */
function buildFeeString(cost: bigint, accountAddress: string, transaction: BrowserWalletTransaction) {
    if (isTransferTransaction(transaction.type)) {
        if (isOutgoingTransaction(transaction, accountAddress)) {
            if (isEncryptedTransfer(transaction)) {
                return 'Shielded transaction fee';
            }
            if (transaction.type !== TransactionType.TransferToPublic) {
                return `${displayAsCcd(-transaction.amount)} + ${displayAsCcd(cost)} Fee`;
            }
            return `${displayAsCcd(-transaction.amount)} + ${displayAsCcd(cost)} Fee`;
        }
    }
    return `${displayAsCcd(cost)} Fee`;
}

/**
 * Maps transaction type to a displayable text string.
 */
function mapTypeToText(type: TransactionType): string {
    switch (type) {
        case TransactionType.DeployModule:
            return 'Module deployment';
        case TransactionType.InitContract:
            return 'Contract initiation';
        case TransactionType.Update:
            return 'Update';
        case TransactionType.Transfer:
            return 'Transfer';
        case TransactionType.AddBaker:
            return 'Add baker';
        case TransactionType.RemoveBaker:
            return 'Remove baker';
        case TransactionType.UpdateBakerStake:
            return 'Baker stake update';
        case TransactionType.UpdateBakerRestakeEarnings:
            return 'Baker restake earnings update';
        case TransactionType.UpdateBakerKeys:
            return 'Baker keys update';
        case TransactionType.UpdateCredentialKeys:
            return 'Credential keys update';
        case TransactionType.BakingReward:
            return 'Baking reward';
        case TransactionType.BlockReward:
            return 'Block reward';
        case TransactionType.FinalizationReward:
            return 'Finalization reward';
        case TransactionType.EncryptedAmountTransfer:
            return 'Shielded transfer';
        case TransactionType.TransferToEncrypted:
            return 'Shielded amount';
        case TransactionType.TransferToPublic:
            return 'Unshielded amount';
        case TransactionType.TransferWithSchedule:
            return 'Scheduled transfer';
        case TransactionType.UpdateCredentials:
            return 'Credentials update';
        case TransactionType.RegisterData:
            return 'Data registration';
        case TransactionType.TransferWithMemo:
            return 'Transfer';
        case TransactionType.EncryptedAmountTransferWithMemo:
            return 'Shielded transfer';
        case TransactionType.TransferWithScheduleAndMemo:
            return 'Scheduled transfer';
        case TransactionType.ConfigureBaker:
            return 'Configure baker';
        case TransactionType.ConfigureDelegation:
            return 'Configure delegation';
        case TransactionType.StakingReward:
            return 'Reward payout';
        default:
            return 'Unknown';
    }
}

function isGreenAmount(transaction: BrowserWalletTransaction, accountAddress: string) {
    if (transaction.status === TransactionStatus.Failed) {
        return false;
    }
    if (
        transaction.type === TransactionType.TransferToPublic &&
        transaction.cost &&
        transaction.amount > transaction.cost
    ) {
        return true;
    }
    return !isOutgoingTransaction(transaction, accountAddress);
}

/**
 * A transaction element in a TransactionList.
 */
export default function TransactionElement({ accountAddress, transaction, style }: Props) {
    const transactionTime = onlyTime(dateFromTimestamp(transaction.time, TimeStampUnit.seconds));
    const failed = transaction.status === TransactionStatus.Failed;

    return (
        <div
            className={clsx('transaction-element', failed && 'transaction-element__failed')}
            style={style}
            role="button"
        >
            {failed ? <Warning className="transaction-element__warning" height="20" /> : null}
            <SidedRow
                left={mapTypeToText(transaction.type)}
                right={
                    <p
                        className={clsx(
                            'transaction-element__amount',
                            isGreenAmount(transaction, accountAddress) && 'transaction-element__amount__greenText'
                        )}
                    >
                        {displayAsCcd(transaction.cost ? transaction.amount - transaction.cost : transaction.amount)}
                    </p>
                }
            />
            <SidedRow
                className="transaction-element__text-faded m-r-15"
                left={
                    <>
                        {transactionTime} {statusIcon(transaction.status)}
                    </>
                }
                right={
                    transaction.cost !== undefined ? buildFeeString(transaction.cost, accountAddress, transaction) : ''
                }
            />
        </div>
    );
}
