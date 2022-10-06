import {
    AccountAddress,
    AccountInfo,
    AccountTransaction,
    AccountTransactionType,
    buildBasicAccountSigner,
    getAccountTransactionHash,
    GtuAmount,
    JsonRpcClient,
    signTransaction,
    SimpleTransferPayload,
    TransactionExpiry,
} from '@concordium/web-sdk';
import { ccdToMicroCcd, getPublicAccountAmounts, isValidCcdString } from 'wallet-common-helpers';

import i18n from '@popup/shell/i18n';
import { BrowserWalletAccountTransaction, TransactionStatus } from './transaction-history-types';

export function buildSimpleTransferPayload(recipient: string, amount: bigint): SimpleTransferPayload {
    return {
        toAddress: new AccountAddress(recipient),
        amount: new GtuAmount(amount),
    };
}

export async function sendTransaction(
    client: JsonRpcClient,
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

export function validateTransferAmount(
    amountToValidate: string,
    accountInfo: AccountInfo | undefined,
    estimatedFee: bigint | undefined
): string | undefined {
    if (!isValidCcdString(amountToValidate)) {
        return i18n.t('utils.ccdAmount.invalid');
    }
    const amountToValidateMicroGTU = ccdToMicroCcd(amountToValidate);
    if (
        accountInfo &&
        getPublicAccountAmounts(accountInfo).atDisposal < amountToValidateMicroGTU + (estimatedFee || 0n)
    ) {
        return i18n.t('utils.ccdAmount.insufficient');
    }
    if (amountToValidateMicroGTU === 0n) {
        return i18n.t('utils.ccdAmount.zero');
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

export function getDefaultExpiry(): TransactionExpiry {
    // TODO: add better default?
    return new TransactionExpiry(new Date(Date.now() + 3600000));
}

export function getTransactionTypeName(type: AccountTransactionType): string {
    switch (type) {
        case AccountTransactionType.SimpleTransfer: {
            return i18n.t('utils.transaction.type.simple');
        }
        case AccountTransactionType.InitializeSmartContractInstance: {
            return i18n.t('utils.transaction.type.init');
        }
        case AccountTransactionType.UpdateSmartContractInstance: {
            return i18n.t('utils.transaction.type.update');
        }
        default: {
            return i18n.t('utils.transaction.type.unknown');
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

export const pendingFromAccountTransaction = (
    transaction: AccountTransaction,
    transactionHash: string,
    cost?: bigint
) => {
    const amount = (transaction.payload as SimpleTransferPayload).amount?.microGtuAmount ?? BigInt(0);
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
