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
    DataBlob,
    CcdAmount,
    AccountAddress,
    ModuleReference,
} from '@concordium/web-sdk';
import { Buffer } from 'buffer/';
import { SmartContractParameters, SchemaType, SchemaWithContext } from '@concordium/browser-wallet-api-helpers';
import { serializationTypes } from '@concordium/browser-wallet-api/src/constants';

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

/**
 * Parse that acts as an inverse for stringify from browser-wallet-api/utils
 */
export function parse(input: string | undefined) {
    if (!input) {
        return undefined;
    }
    return JSON.parse(input, (_, v) => {
        if (v) {
            switch (v['@type']) {
                case serializationTypes.BigInt:
                    return BigInt(v.value);
                case serializationTypes.Date:
                    return new Date(v.value);
                case serializationTypes.Buffer:
                    return Buffer.from(v.value, 'base64');
                case serializationTypes.CcdAmount:
                    return new CcdAmount(BigInt(v.value));
                case serializationTypes.AccountAddress:
                    return new AccountAddress(v.value);
                case serializationTypes.ModuleReference:
                    return new ModuleReference(v.value);
                case serializationTypes.DataBlob:
                    return new DataBlob(Buffer.from(v.value, 'hex'));
                default:
                    return v;
            }
        }
        return v;
    });
}

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
            const updatePayload = payload as UpdateContractPayload;
            const [contractName, functionName] = updatePayload.receiveName.split('.');

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
                    ...updatePayload,
                    message: parameter,
                },
            };
        }
        case AccountTransactionType.InitContract: {
            const initPayload = payload as InitContractPayload;
            let parameter: Buffer;
            if (parameters === undefined || parameters === null || !schema) {
                parameter = Buffer.alloc(0);
            } else if (schema.type === SchemaType.Module) {
                parameter = serializeInitContractParameters(
                    initPayload.initName,
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
                    ...initPayload,
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
