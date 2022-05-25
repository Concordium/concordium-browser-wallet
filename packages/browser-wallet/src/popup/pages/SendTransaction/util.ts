import {
    AccountTransactionType,
    AccountAddress,
    GtuAmount,
    SimpleTransferPayload,
    UpdateContractPayload,
    serializeUpdateContractParameters,
    AccountTransactionPayload,
} from '@concordium/web-sdk';
import { Buffer } from 'buffer/';

export type HeadlessTransaction =
    | { type: AccountTransactionType.UpdateSmartContractInstance; payload: UpdateContractPayload }
    | { type: AccountTransactionType.SimpleTransfer; payload: SimpleTransferPayload }
    | {
          type: Exclude<
              AccountTransactionType,
              AccountTransactionType.SimpleTransfer | AccountTransactionType.UpdateSmartContractInstance
          >;
          payload: AccountTransactionPayload;
      };

export function parsePayload(
    transaction: HeadlessTransaction,
    parameters?: Record<string, unknown>,
    schema?: string
): HeadlessTransaction {
    switch (transaction.type) {
        case AccountTransactionType.SimpleTransfer: {
            const { payload } = transaction;
            return {
                type: transaction.type,
                payload: {
                    amount: new GtuAmount(BigInt(payload.amount.microGtuAmount)),
                    toAddress: new AccountAddress(payload.toAddress.address),
                },
            };
        }
        case AccountTransactionType.UpdateSmartContractInstance: {
            const [contractName, functionName] = transaction.payload.receiveName.split('.');

            const parameter =
                parameters && schema
                    ? serializeUpdateContractParameters(
                          contractName,
                          functionName,
                          parameters,
                          Buffer.from(schema, 'base64')
                      )
                    : Buffer.alloc(0);

            const { payload } = transaction;
            return {
                type: transaction.type,
                payload: {
                    amount: new GtuAmount(BigInt(payload.amount.microGtuAmount)),
                    contractAddress: {
                        index: BigInt(payload.contractAddress.index),
                        subindex: BigInt(payload.contractAddress.subindex),
                    },
                    receiveName: payload.receiveName,
                    maxContractExecutionEnergy: BigInt(payload.maxContractExecutionEnergy),
                    parameter,
                },
            };
        }
        default:
            throw new Error('Unsupported transaction type');
    }
}
