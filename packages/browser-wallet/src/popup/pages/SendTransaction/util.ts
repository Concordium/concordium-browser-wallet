import {
    AccountTransactionType,
    SimpleTransferPayload,
    UpdateContractPayload,
    serializeUpdateContractParameters,
    AccountTransactionPayload,
    InitContractPayload,
    serializeInitContractParameters,
} from '@concordium/web-sdk';
import { Buffer } from 'buffer/';
import { parse } from '@concordium/browser-wallet-api/src/util';

export type HeadlessTransaction =
    | { type: AccountTransactionType.UpdateSmartContractInstance; payload: UpdateContractPayload }
    | { type: AccountTransactionType.SimpleTransfer; payload: SimpleTransferPayload }
    | { type: AccountTransactionType.InitializeSmartContractInstance; payload: InitContractPayload }
    | {
          type: Exclude<
              AccountTransactionType,
              | AccountTransactionType.SimpleTransfer
              | AccountTransactionType.UpdateSmartContractInstance
              | AccountTransactionType.InitializeSmartContractInstance
          >;
          payload: AccountTransactionPayload;
      };

export function parsePayload(
    type: AccountTransactionType,
    stringifiedPayload: string,
    parameters?: Record<string, unknown>,
    schema?: string
): HeadlessTransaction {
    const payload = parse(stringifiedPayload);

    switch (type) {
        case AccountTransactionType.UpdateSmartContractInstance: {
            const [contractName, functionName] = payload.receiveName.split('.');

            const parameter =
                parameters && schema
                    ? serializeUpdateContractParameters(
                          contractName,
                          functionName,
                          parameters,
                          Buffer.from(schema, 'base64')
                      )
                    : Buffer.alloc(0);
            // Overwrite whatever parameter has been provided. Ensures that what we show and what is signed is the same.
            return {
                type,
                payload: {
                    ...payload,
                    parameter,
                },
            };
        }
        case AccountTransactionType.InitializeSmartContractInstance: {
            const parameter =
                parameters && schema
                    ? serializeInitContractParameters(payload.contractName, parameters, Buffer.from(schema, 'base64'))
                    : Buffer.alloc(0);
            // Overwrite whatever parameter has been provided. Ensures that what we show and what is signed is the same.
            return {
                type,
                payload: {
                    ...payload,
                    parameter,
                },
            };
        }
        default:
            return {
                type,
                payload,
            };
    }
}
