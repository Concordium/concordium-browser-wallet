import {
    AccountAddress,
    AccountTransaction,
    AccountTransactionType,
    AccountTransactionPayload,
    buildBasicAccountSigner,
    getAccountTransactionHash,
    CcdAmount,
    ConcordiumGRPCClient,
    signTransaction,
    SimpleTransferPayload,
    TransactionExpiry,
    AccountInfo,
    ChainParameters,
    ChainParametersV0,
    BakerPoolStatusDetails,
    InitContractPayload,
    UpdateContractPayload,
    SimpleTransferWithMemoPayload,
    AccountInfoType,
    convertEnergyToMicroCcd,
    Energy,
} from '@concordium/web-sdk';
import {
    isValidResolutionString,
    ccdToMicroCcd,
    displayAsCcd,
    fractionalToInteger,
    isValidCcdString,
    getPublicAccountAmounts,
} from 'wallet-common-helpers';

import i18n from '@popup/shell/i18n';
import { useAtomValue } from 'jotai';
import { addPendingTransactionAtom, selectedPendingTransactionsAtom } from '@popup/store/transactions';
import { DEFAULT_TRANSACTION_EXPIRY } from '@shared/constants/time';
import { useCallback } from 'react';
import { grpcClientAtom } from '@popup/store/settings';
import { useUpdateAtom } from 'jotai/utils';
import { BrowserWalletAccountTransaction, TransactionStatus } from './transaction-history-types';
import { useBlockChainParameters } from '../BlockChainParametersProvider';
import { usePrivateKey } from './account-helpers';
import { getEnergyCost } from '@shared/utils/energy-helpers';

export function buildSimpleTransferPayload(recipient: string, amount: bigint): SimpleTransferPayload {
    return {
        toAddress: AccountAddress.fromBase58(recipient),
        amount: CcdAmount.fromMicroCcd(amount),
    };
}

export async function sendTransaction(
    client: ConcordiumGRPCClient,
    transaction: AccountTransaction,
    signingKey: string
): Promise<string> {
    const signature = await signTransaction(transaction, buildBasicAccountSigner(signingKey));
    const result = await client.sendAccountTransaction(transaction, signature);

    if (!result) {
        throw new Error('transaction was rejected by the node');
    }

    return getAccountTransactionHash(transaction, signature);
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
    if (!isValidResolutionString(10n ** BigInt(decimals), false, false, false)(transferAmount)) {
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
    chainParameters?: Exclude<ChainParameters, ChainParametersV0>,
    accountInfo?: AccountInfo,
    estimatedFee = 0n
): string | undefined {
    if (!isValidCcdString(amountToValidate)) {
        return i18n.t('utils.ccdAmount.invalid');
    }
    const bakerStakeThreshold = chainParameters?.minimumEquityCapital.microCcdAmount || 0n;
    const amount = ccdToMicroCcd(amountToValidate);

    const amountChanged =
        accountInfo?.type !== AccountInfoType.Baker || amount !== accountInfo.accountBaker.stakedAmount.microCcdAmount;

    if (amountChanged && bakerStakeThreshold > amount) {
        return i18n.t('utils.ccdAmount.belowBakerThreshold', { threshold: displayAsCcd(bakerStakeThreshold) });
    }

    if (
        accountInfo &&
        (BigInt(accountInfo.accountAmount.microCcdAmount) < amount + estimatedFee ||
            // the fee must be paid with the current funds at disposal, because a reduction in delegation amount is not immediate.
            getPublicAccountAmounts(accountInfo).atDisposal < estimatedFee)
    ) {
        return i18n.t('utils.ccdAmount.insufficient');
    }

    return undefined;
}

export function validateAccountAddress(cand: string): string | undefined {
    try {
        // eslint-disable-next-line no-new
        AccountAddress.fromBase58(cand);
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

    const max =
        targetStatus && targetStatus.delegatedCapitalCap && targetStatus.delegatedCapital
            ? targetStatus.delegatedCapitalCap.microCcdAmount - targetStatus.delegatedCapital.microCcdAmount
            : undefined;
    if (max !== undefined && amount > max) {
        return i18n.t('utils.ccdAmount.exceedingDelegationCap', { max: displayAsCcd(max) });
    }

    if (
        BigInt(accountInfo.accountAmount.microCcdAmount) < amount + estimatedFee ||
        // the fee must be paid with the current funds at disposal, because a reduction in delegation amount is not immediate.
        getPublicAccountAmounts(accountInfo).atDisposal < estimatedFee
    ) {
        return i18n.t('utils.ccdAmount.insufficient');
    }

    return undefined;
}

export function getDefaultExpiry(): TransactionExpiry.Type {
    return TransactionExpiry.fromDate(new Date(Date.now() + DEFAULT_TRANSACTION_EXPIRY));
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

/**
 * Extract the microCCD amount related for the transaction, excluding the cost.
 * Note that for many transactions there is no related amount, in which case this returns 0.
 */
export function getTransactionAmount(type: AccountTransactionType, payload: AccountTransactionPayload): bigint {
    switch (type) {
        case AccountTransactionType.InitContract:
            return (payload as InitContractPayload).amount.microCcdAmount;
        case AccountTransactionType.Update:
            return (payload as UpdateContractPayload).amount.microCcdAmount;
        case AccountTransactionType.Transfer:
            return (payload as SimpleTransferPayload).amount.microCcdAmount;
        case AccountTransactionType.TransferWithMemo:
            return (payload as SimpleTransferWithMemoPayload).amount.microCcdAmount;
        default:
            return 0n;
    }
}
/** Hook which exposes a function for getting the transaction fee for a given transaction type */
export function useGetTransactionFee() {
    const cp = useBlockChainParameters();

    return useCallback(
        (type: AccountTransactionType, payload: AccountTransactionPayload) => {
            if (cp === undefined) {
                return undefined;
            }
            const energy = getEnergyCost(type, payload);
            return convertEnergyToMicroCcd(Energy.create(energy), cp);
        },
        [cp]
    );
}

/** Types of errors returned when attempting transaction submission */
export enum TransactionSubmitErrorType {
    InsufficientFunds = 'InsufficientFunds',
}

/** Error returned when attempting to submit a transaction using {@linkcode useTransactionSubmit} */
export class TransactionSubmitError extends Error {
    private constructor(public type: TransactionSubmitErrorType) {
        super();
        super.name = `TransactionSubmitError.${type}`;
    }

    public static insufficientFunds(): TransactionSubmitError {
        return new TransactionSubmitError(TransactionSubmitErrorType.InsufficientFunds);
    }
}

/**
 * Hook returning a function to submit a transaction of the specified type from the specified sender.
 * If successful, a pending transaction is added to the local store which will then await finalization status from the node.
 *
 * @param sender - The account address of the sender.
 * @param type - The type of the account transaction.
 *
 * @returns A function to submit a transaction.
 * @throws {@linkcode TransactionSubmitError}
 */
export function useTransactionSubmit(sender: AccountAddress.Type, type: AccountTransactionType) {
    const grpc = useAtomValue(grpcClientAtom);
    const key = usePrivateKey(sender.address);
    const addPendingTransaction = useUpdateAtom(addPendingTransactionAtom);

    return useCallback(
        async (payload: AccountTransactionPayload, cost: CcdAmount.Type) => {
            const accountInfo = await grpc.getAccountInfo(sender);
            const available = [
                AccountTransactionType.ConfigureBaker,
                AccountTransactionType.ConfigureDelegation,
            ].includes(type)
                ? accountInfo.accountAmount
                : accountInfo.accountAvailableBalance;
            if (available.microCcdAmount < getTransactionAmount(type, payload) + (cost.microCcdAmount || 0n)) {
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
