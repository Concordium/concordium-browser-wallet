import {
    AccountTransactionType,
    SimpleTransferPayload,
    UpdateContractPayload,
    serializeUpdateContractParameters,
    AccountTransactionPayload,
    SchemaVersion,
    InitContractPayload,
    serializeInitContractParameters,
    serializeTypeValue,
} from '@concordium/web-sdk';
import { Buffer } from 'buffer/';
import { parse } from '@concordium/browser-wallet-api/src/util';
import { SmartContractParameters } from '@shared/utils/types';
import { SchemaType, SchemaWithContext } from '@concordium/browser-wallet-api-helpers';

export type HeadlessTransaction =
    | { type: AccountTransactionType.Update; payload: UpdateContractPayload }
    | { type: AccountTransactionType.Transfer; payload: SimpleTransferPayload }
    | { type: AccountTransactionType.InitContract; payload: InitContractPayload }
    | {
          type: Exclude<
              AccountTransactionType,
              AccountTransactionType.Transfer | AccountTransactionType.Update | AccountTransactionType.InitContract
          >;
          payload: AccountTransactionPayload;
      };

export function parsePayload(
    type: AccountTransactionType,
    stringifiedPayload: string,
    parameters?: SmartContractParameters,
    schema?: SchemaWithContext,
    schemaVersion: SchemaVersion = 0
): HeadlessTransaction {
    const payload = parse(stringifiedPayload);

    switch (type) {
        case AccountTransactionType.Update: {
            const [contractName, functionName] = payload.receiveName.split('.');

            let parameter: Buffer;
            if (parameters === undefined || parameters === null || !schema) {
                parameter = Buffer.alloc(0);
            } else if (schema.type === SchemaType.Module) {
                parameter = serializeUpdateContractParameters(
                    contractName,
                    functionName,
                    parameters,
                    Buffer.from(schema.value, 'base64'),
                    schemaVersion
                );
            } else {
                parameter = serializeTypeValue(parameters, Buffer.from(schema.value, 'base64'));
            }

            // Overwrite whatever parameter has been provided. Ensures that what we show and what is signed is the same.
            return {
                type,
                payload: {
                    ...(payload as UpdateContractPayload),
                    message: parameter,
                },
            };
        }
        case AccountTransactionType.InitContract: {
            let parameter: Buffer;
            if (parameters === undefined || parameters === null || !schema) {
                parameter = Buffer.alloc(0);
            } else if (schema.type === SchemaType.Module) {
                parameter = serializeInitContractParameters(
                    payload.initName,
                    parameters,
                    Buffer.from(schema.value, 'base64'),
                    schemaVersion
                );
            } else {
                parameter = serializeTypeValue(parameters, Buffer.from(schema.value, 'base64'));
            }

            // Overwrite whatever parameter has been provided. Ensures that what we show and what is signed is the same.
            return {
                type,
                payload: {
                    ...(payload as InitContractPayload),
                    param: parameter,
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
