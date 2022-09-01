import {
    AccountAddress,
    AccountInfo,
    AccountTransaction,
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
