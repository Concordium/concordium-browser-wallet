/* eslint-disable @typescript-eslint/no-explicit-any */
import { AccountTransactionType, AccountTransaction } from '@concordium/web-sdk';

export function bigintToStringAccountTransactionFields(transaction: Omit<AccountTransaction, 'header'>): any {
    switch (transaction.type) {
        case AccountTransactionType.SimpleTransfer: {
            const transformed: any = transaction;
            transformed.payload.amount.microGtuAmount = transformed.payload.amount.microGtuAmount.toString();
            return transformed;
        }
        case AccountTransactionType.UpdateSmartContractInstance: {
            const transformed: any = transaction;
            transformed.payload.amount.microGtuAmount = transformed.payload.amount.microGtuAmount.toString();
            transformed.payload.contractAddress = {
                index: transformed.payload.contractAddress.index.toString(),
                subindex: transformed.payload.contractAddress.subindex.toString(),
            };
            transformed.payload.maxContractExecutionEnergy = transformed.payload.maxContractExecutionEnergy.toString();
            return transformed;
        }
        default:
            throw new Error('Unsupported transaction type');
    }
}
