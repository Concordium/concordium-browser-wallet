import React, { CSSProperties } from 'react';
import { TFunction, useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { AccountTransactionType } from '@concordium/web-sdk';
import { displayAsCcd, dateFromTimestamp, TimeStampUnit } from 'wallet-common-helpers';

import {
    BrowserWalletTransaction,
    RewardType,
    SpecialTransactionType,
    TransactionStatus,
} from '@popup/shared/utils/transaction-history-types';
import Button from '@popup/popupX/shared/Button';
import Text from '@popup/popupX/shared/Text';
import Note from '@assets/svgX/note.svg';
import { displaySplitAddressShort } from '@popup/shared/utils/account-helpers';

const SPACING = 4;
export const TRANSACTION_ELEMENT_HEIGHT = 68; // element height + row spacing = rem(64px) + rem(4px)

/** Convert Date object to local string only showing the current time. */
const onlyTime = Intl.DateTimeFormat(undefined, {
    timeStyle: 'short',
    hour12: false,
}).format;

/** Check if type is an account transaction which transfers some CCD. */
function isTransferTransaction(
    type: AccountTransactionType | RewardType | SpecialTransactionType
): type is AccountTransactionType {
    switch (type) {
        case AccountTransactionType.Transfer:
        case AccountTransactionType.TransferWithMemo:
        case AccountTransactionType.TransferToEncrypted:
        case AccountTransactionType.TransferToPublic:
        case AccountTransactionType.TransferWithSchedule:
        case AccountTransactionType.TransferWithScheduleAndMemo:
        case AccountTransactionType.EncryptedAmountTransfer:
        case AccountTransactionType.EncryptedAmountTransferWithMemo:
            return true;
        default:
            return false;
    }
}

/** Check if type is an account transaction which transfers some CCD or is a reward. */
function hasAmount(type: AccountTransactionType | RewardType | SpecialTransactionType) {
    return isTransferTransaction(type) || type in RewardType;
}

/**
 * Maps transaction type to a displayable text string.
 */
function mapTypeToText(
    type: AccountTransactionType | RewardType | SpecialTransactionType,
    t: TFunction<'x', 'transactionLogX'>
): string {
    switch (type) {
        case AccountTransactionType.DeployModule:
            return t('deployModule');
        case AccountTransactionType.InitContract:
            return t('initContract');
        case AccountTransactionType.Update:
            return t('update');
        case AccountTransactionType.Transfer:
            return t('transfer');
        case AccountTransactionType.AddBaker:
            return t('addBaker');
        case AccountTransactionType.RemoveBaker:
            return t('removeBaker');
        case AccountTransactionType.UpdateBakerStake:
            return t('updateBakerStake');
        case AccountTransactionType.UpdateBakerRestakeEarnings:
            return t('updateBakerRestakeEarnings');
        case AccountTransactionType.UpdateBakerKeys:
            return t('updateBakerKeys');
        case AccountTransactionType.UpdateCredentialKeys:
            return t('updateCredentialKeys');
        case RewardType.BakingReward:
            return t('bakingReward');
        case RewardType.BlockReward:
            return t('blockReward');
        case RewardType.FinalizationReward:
            return t('finalizationReward');
        case AccountTransactionType.EncryptedAmountTransfer:
            return t('encryptedAmountTransfer');
        case AccountTransactionType.TransferToEncrypted:
            return t('transferToEncrypted');
        case AccountTransactionType.TransferToPublic:
            return t('transferToPublic');
        case AccountTransactionType.TransferWithSchedule:
            return t('transferWithSchedule');
        case AccountTransactionType.UpdateCredentials:
            return t('updateCredentials');
        case AccountTransactionType.RegisterData:
            return t('registerData');
        case AccountTransactionType.TransferWithMemo:
            return t('transferWithMemo');
        case AccountTransactionType.EncryptedAmountTransferWithMemo:
            return t('encryptedAmountTransferWithMemo');
        case AccountTransactionType.TransferWithScheduleAndMemo:
            return t('transferWithScheduleAndMemo');
        case AccountTransactionType.ConfigureBaker:
            return t('configureBaker');
        case AccountTransactionType.ConfigureDelegation:
            return t('configureDelegation');
        case RewardType.StakingReward:
            return t('stakingReward');
        case SpecialTransactionType.Malformed:
            return t('malformed');
        default:
            return t('unknown');
    }
}

interface Props {
    transaction: BrowserWalletTransaction;
    style?: CSSProperties;
    accountAddress: string;
    onClick?: () => void;
}

/**
 * A transaction element in a TransactionList.
 */
export default function TransactionElement({ accountAddress, transaction, style, onClick }: Props) {
    const { t } = useTranslation('x', { keyPrefix: 'transactionLogX' });

    const failed = transaction.status === TransactionStatus.Failed;
    const isSender = transaction.fromAddress === accountAddress;

    // Flip the amount if selected account is sender, and amount is positive. We expect the transaction list endpoint to sign the amount based on this,
    // but this is not the case for pending transactions. This seeks to emulate the behaviour of the transaction list endpoint.
    const amount =
        isSender && transaction.status === TransactionStatus.Pending && transaction.amount > 0n
            ? -transaction.amount
            : transaction.amount;
    const time = onlyTime(dateFromTimestamp(transaction.time, TimeStampUnit.seconds));
    const info =
        (transaction.cost !== undefined && t('withFee', { value: displayAsCcd(transaction.cost, false, true) })) ??
        (transaction.fromAddress && t('from', { value: displaySplitAddressShort(transaction.fromAddress) }));

    return (
        <Button.Base
            key={transaction.transactionHash}
            className="transaction-log__transaction"
            style={{ ...style, height: TRANSACTION_ELEMENT_HEIGHT - SPACING }}
            onClick={onClick}
        >
            <div className={clsx('transaction value', failed && 'failed')}>
                <Text.Label className="type">{mapTypeToText(transaction.type, t)}</Text.Label>
                {hasAmount(transaction.type) && !failed && (
                    <Text.Label className={clsx(amount > 0 && 'income')}>
                        {displayAsCcd(transaction.amount, false, true)}
                    </Text.Label>
                )}
            </div>
            <div className="transaction info">
                <Text.Capture>{time}</Text.Capture>
                {info && <Text.Capture>{info}</Text.Capture>}
            </div>
            {transaction.memo && (
                <div className="transaction note">
                    <Note />
                    <Text.Capture>{transaction.memo}</Text.Capture>
                </div>
            )}
        </Button.Base>
    );
}
