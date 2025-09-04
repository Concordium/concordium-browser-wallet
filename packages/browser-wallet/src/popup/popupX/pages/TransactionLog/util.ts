import { useMemo } from 'react';
import { TFunction } from 'react-i18next';
import groupBy from 'lodash.groupby';
import {
    BlockSpecialEvent,
    BrowserWalletTransaction,
    RewardType,
    SpecialTransactionType,
} from '@popup/shared/utils/transaction-history-types';
import { dateFromTimestamp } from 'wallet-common-helpers';
import { AccountTransactionType } from '@concordium/web-sdk';
import i18n from '@popup/shell/i18n';

/** Convert Date object to local string only showing the current date. */
export const onlyDate = (date?: number | Date | undefined) =>
    `${Intl.DateTimeFormat(undefined, {
        day: '2-digit',
    }).format(date)} ${Intl.DateTimeFormat(undefined, {
        month: 'short',
        year: 'numeric',
    }).format(date)}`;

export type TransactionsByDateTuple = [string, BrowserWalletTransaction[]];

export default function useTransactionGroups(transactions: BrowserWalletTransaction[]): TransactionsByDateTuple[] {
    const transactionGroups = useMemo(
        () => Object.entries(groupBy(transactions, (t) => onlyDate(dateFromTimestamp(t.time)))),
        [transactions]
    );

    return transactionGroups;
}

/** Parameters parsed from the path */
export type TransactionLogParams = {
    /** Address of the account to display transactions for. */
    account: string;
};

/** Convert Date object to local string only showing the current time. */
export const onlyTime = Intl.DateTimeFormat(undefined, {
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
export function hasAmount(type: AccountTransactionType | RewardType | SpecialTransactionType) {
    return isTransferTransaction(type) || type in RewardType;
}

const t: TFunction<'x', 'transactionLogX'> = (key) => i18n.t(`x:transactionLogX.${key}`);

/**
 * Maps transaction type to a displayable text string.
 */
export function mapTypeToText(
    type: AccountTransactionType | RewardType | SpecialTransactionType | BlockSpecialEvent
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
        case AccountTransactionType.TokenUpdate:
            return t('tokenUpdate');
        case SpecialTransactionType.UpdateCreatePLT:
            return t('updateCreatePlt');
        case SpecialTransactionType.ChainUpdate:
            return t('chainUpdate');
        case RewardType.StakingReward:
            return t('stakingReward');
        case SpecialTransactionType.Malformed:
            return t('malformed');
        case BlockSpecialEvent.BakingRewards:
            return t('bakingRewards');
        case BlockSpecialEvent.Mint:
            return t('mint');
        case BlockSpecialEvent.FinalizationRewards:
            return t('finalizationRewards');
        case BlockSpecialEvent.PaydayFoundationReward:
            return t('paydayFoundationReward');
        case BlockSpecialEvent.BlockAccrueReward:
            return t('blockAccrueReward');
        case BlockSpecialEvent.PaydayPoolReward:
            return t('paydayPoolReward');
        case BlockSpecialEvent.ValidatorSuspended:
            return t('validatorSuspended');
        case BlockSpecialEvent.ValidatorPrimedForSuspension:
            return t('validatorPrimedForSuspension');
        default:
            return t('unknown');
    }
}
