import SidedRow from '@popup/shared/SidedRow';
import React, { CSSProperties } from 'react';
import DoubleCheckmarkIcon from '@assets/svg/double-grey-checkmark.svg';
import Warning from '@assets/svg/warning.svg';
import { displayAsCcd } from 'wallet-common-helpers/lib/utils/ccd';
import {
    BrowserWalletTransaction,
    isAccountTransaction,
    RewardType,
    TransactionStatus,
} from '@popup/shared/utils/transaction-history-types';
import { dateFromTimestamp, TimeStampUnit } from 'wallet-common-helpers';
import clsx from 'clsx';
import { AccountTransactionType } from '@concordium/web-sdk';

export const transactionElementHeight = 58;

interface Props {
    transaction: BrowserWalletTransaction;
    style?: CSSProperties;
    accountAddress: string;
    onClick?: () => void;
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
    return (
        isAccountTransaction(transaction) &&
        [AccountTransactionType.EncryptedTransfer, AccountTransactionType.EncryptedTransferWithMemo].includes(
            transaction.type
        )
    );
}

function isTransferTransaction(type: AccountTransactionType) {
    switch (type) {
        case AccountTransactionType.SimpleTransfer:
        case AccountTransactionType.SimpleTransferWithMemo:
        case AccountTransactionType.TransferToEncrypted:
        case AccountTransactionType.TransferToPublic:
        case AccountTransactionType.TransferWithSchedule:
        case AccountTransactionType.TransferWithScheduleWithMemo:
        case AccountTransactionType.EncryptedTransfer:
        case AccountTransactionType.EncryptedTransferWithMemo:
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
    if (isAccountTransaction(transaction) && isTransferTransaction(transaction.type)) {
        if (isOutgoingTransaction(transaction, accountAddress)) {
            if (isEncryptedTransfer(transaction)) {
                return 'Shielded transaction fee';
            }
            return `${displayAsCcd(-transaction.amount)} + ${displayAsCcd(cost)} Fee`;
        }
    }
    return `${displayAsCcd(cost)} Fee`;
}

/**
 * Maps transaction type to a displayable text string.
 */
function mapTypeToText(type: AccountTransactionType | RewardType): string {
    switch (type) {
        case AccountTransactionType.DeployModule:
            return 'Module deployment';
        case AccountTransactionType.InitializeSmartContractInstance:
            return 'Contract initiation';
        case AccountTransactionType.UpdateSmartContractInstance:
            return 'Update';
        case AccountTransactionType.SimpleTransfer:
            return 'Transfer';
        case AccountTransactionType.AddBaker:
            return 'Add baker';
        case AccountTransactionType.RemoveBaker:
            return 'Remove baker';
        case AccountTransactionType.UpdateBakerStake:
            return 'Baker stake update';
        case AccountTransactionType.UpdateBakerRestakeEarnings:
            return 'Baker restake earnings update';
        case AccountTransactionType.UpdateBakerKeys:
            return 'Baker keys update';
        case AccountTransactionType.UpdateCredentialKeys:
            return 'Credential keys update';
        case RewardType.BakingReward:
            return 'Baking reward';
        case RewardType.BlockReward:
            return 'Block reward';
        case RewardType.FinalizationReward:
            return 'Finalization reward';
        case AccountTransactionType.EncryptedTransfer:
            return 'Shielded transfer';
        case AccountTransactionType.TransferToEncrypted:
            return 'Shielded amount';
        case AccountTransactionType.TransferToPublic:
            return 'Unshielded amount';
        case AccountTransactionType.TransferWithSchedule:
            return 'Scheduled transfer';
        case AccountTransactionType.UpdateCredentials:
            return 'Credentials update';
        case AccountTransactionType.RegisterData:
            return 'Data registration';
        case AccountTransactionType.SimpleTransferWithMemo:
            return 'Transfer';
        case AccountTransactionType.EncryptedTransferWithMemo:
            return 'Shielded transfer';
        case AccountTransactionType.TransferWithScheduleWithMemo:
            return 'Scheduled transfer';
        case AccountTransactionType.ConfigureBaker:
            return 'Configure baker';
        case AccountTransactionType.ConfigureDelegation:
            return 'Configure delegation';
        case RewardType.StakingReward:
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
        transaction.type === AccountTransactionType.TransferToPublic &&
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
export default function TransactionElement({ accountAddress, transaction, style, onClick }: Props) {
    const transactionTime = onlyTime(dateFromTimestamp(transaction.time, TimeStampUnit.seconds));
    const failed = transaction.status === TransactionStatus.Failed;

    return (
        <div
            className={clsx(
                'transaction-element',
                failed && 'transaction-element__failed',
                onClick && 'transaction-element__clickable'
            )}
            style={style}
            role="button"
            onClick={onClick}
            onKeyPress={onClick}
            tabIndex={0}
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
