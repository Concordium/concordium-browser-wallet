import {
    AccountAddress,
    AccountTransaction,
    AccountTransactionType,
    getAccountTransactionHash,
    CcdAmount,
    ConcordiumGRPCClient,
    SimpleTransferPayload,
    TransactionExpiry,
    AccountInfo,
    ChainParametersV1,
    BakerPoolStatusDetails,
    Network,
} from '@concordium/web-sdk';
import { ccdToMicroCcd, displayAsCcd, fractionalToInteger, isValidCcdString } from 'wallet-common-helpers';

import i18n from '@popup/shell/i18n';
import { useAtomValue } from 'jotai';
import { selectedPendingTransactionsAtom } from '@popup/store/transactions';
import { DEFAULT_TRANSACTION_EXPIRY } from '@shared/constants/time';
import { ConcordiumLedgerClient, getAccountPath } from '@concordium/ledger-bindings';
import { WalletCredential } from '@shared/storage/types';
import { BrowserWalletAccountTransaction, TransactionStatus } from './transaction-history-types';

export function buildSimpleTransferPayload(recipient: string, amount: bigint): SimpleTransferPayload {
    return {
        toAddress: new AccountAddress(recipient),
        amount: new CcdAmount(amount),
    };
}

export async function sendTransaction(
    client: ConcordiumGRPCClient,
    transaction: AccountTransaction,
    cred: WalletCredential,
    ledger: ConcordiumLedgerClient | undefined,
    net: Network
): Promise<string> {
    if (!ledger) {
        throw new Error('No ledger available');
    }

    const path = getAccountPath(
        { identityProviderIndex: cred.providerIndex, identityIndex: cred.identityIndex, accountIndex: cred.credNumber },
        net
    );
    const rawSignature = (await ledger.signAccountTransaction(transaction, path)).toString('hex');
    const transactionSignature = { 0: { 0: rawSignature } };
    const result = await client.sendAccountTransaction(transaction, transactionSignature);

    if (!result) {
        throw new Error('transaction was rejected by the node');
    }

    return getAccountTransactionHash(transaction, transactionSignature);
}

/**
 * Validates if the chosen transfer amount can be sent with the current balance at disposal.
 * @param decimals how many decimals can the transfer amount. This is used to convert it from a fractional string to an integer.
 * @param estimatedFee additional costs for the transfer.
 */
export function validateTransferAmount(
    transferAmount: string,
    atDisposal: bigint | undefined,
    decimals = 0,
    estimatedFee = 0n
): string | undefined {
    if (!isValidCcdString(transferAmount)) {
        return i18n.t('utils.ccdAmount.invalid');
    }
    const amountToValidateInteger = fractionalToInteger(transferAmount, decimals);
    if (atDisposal !== undefined && atDisposal < amountToValidateInteger + estimatedFee) {
        return i18n.t('utils.ccdAmount.insufficient');
    }
    if (amountToValidateInteger === 0n) {
        return i18n.t('utils.ccdAmount.zero');
    }
    return undefined;
}

export function validateBakerStake(
    amountToValidate: string,
    chainParameters?: ChainParametersV1,
    accountInfo?: AccountInfo,
    estimatedFee?: bigint
): string | undefined {
    if (!isValidCcdString(amountToValidate)) {
        return i18n.t('utils.ccdAmount.invalid');
    }
    const bakerStakeThreshold = chainParameters?.minimumEquityCapital || 0n;
    const amount = ccdToMicroCcd(amountToValidate);
    if (bakerStakeThreshold > amount) {
        return i18n.t('utils.ccdAmount.belowBakerThreshold', { threshold: displayAsCcd(bakerStakeThreshold) });
    }
    if (accountInfo && BigInt(accountInfo.accountAmount) < amount + (estimatedFee || 0n)) {
        return i18n.t('utils.ccdAmount.insufficient');
    }

    return undefined;
}

export function validateAccountAddress(cand: string): string | undefined {
    try {
        // eslint-disable-next-line no-new
        new AccountAddress(cand);
        return undefined;
    } catch {
        return i18n.t('utils.address.invalid');
    }
}

export function validateDelegationAmount(
    delegatedAmount: string,
    accountInfo: AccountInfo,
    estimatedFee: bigint,
    targetStatus?: BakerPoolStatusDetails
): string | undefined {
    if (!isValidCcdString(delegatedAmount)) {
        return i18n.t('utils.ccdAmount.invalid');
    }

    const amount = ccdToMicroCcd(delegatedAmount);

    if (amount === 0n) {
        return i18n.t('utils.ccdAmount.zero');
    }

    const max = targetStatus ? targetStatus.delegatedCapitalCap - targetStatus.delegatedCapital : undefined;
    if (max !== undefined && amount > max) {
        return i18n.t('utils.ccdAmount.exceedingDelegationCap', { max: displayAsCcd(max) });
    }

    if (BigInt(accountInfo.accountAmount) < amount + estimatedFee) {
        return i18n.t('utils.ccdAmount.insufficient');
    }

    return undefined;
}

export function getDefaultExpiry(): TransactionExpiry {
    return new TransactionExpiry(new Date(Date.now() + DEFAULT_TRANSACTION_EXPIRY));
}

export function getTransactionTypeName(type: AccountTransactionType): string {
    switch (type) {
        case AccountTransactionType.Transfer: {
            return i18n.t('utils.transaction.type.simple');
        }
        case AccountTransactionType.InitContract: {
            return i18n.t('utils.transaction.type.init');
        }
        case AccountTransactionType.Update: {
            return i18n.t('utils.transaction.type.update');
        }
        case AccountTransactionType.RegisterData: {
            return i18n.t('utils.transaction.type.registerData');
        }
        case AccountTransactionType.ConfigureDelegation: {
            return i18n.t('utils.transaction.type.configureDelegation');
        }
        case AccountTransactionType.ConfigureBaker: {
            return i18n.t('utils.transaction.type.configureBaker');
        }
        default: {
            return AccountTransactionType[type];
        }
    }
}

export const createPendingTransaction = (
    type: AccountTransactionType,
    transactionHash: string,
    amount: bigint,
    cost?: bigint,
    fromAddress?: string,
    toAddress?: string
): BrowserWalletAccountTransaction => ({
    amount,
    blockHash: '',
    events: [],
    type,
    status: TransactionStatus.Pending,
    time: BigInt(Math.round(Date.now() / 1000)),
    id: 0,
    cost,
    transactionHash,
    fromAddress,
    toAddress,
});

export const createPendingTransactionFromAccountTransaction = (
    transaction: AccountTransaction,
    transactionHash: string,
    cost?: bigint
) => {
    const amount = (transaction.payload as SimpleTransferPayload).amount?.microCcdAmount ?? BigInt(0);
    const toAddress = (transaction.payload as SimpleTransferPayload).toAddress?.address;

    return createPendingTransaction(
        transaction.type,
        transactionHash,
        amount,
        cost,
        transaction.header.sender.address,
        toAddress
    );
};

export function useHasPendingTransaction(transactionType: AccountTransactionType): boolean {
    return useAtomValue(selectedPendingTransactionsAtom).some((t) => t.type === transactionType);
}
