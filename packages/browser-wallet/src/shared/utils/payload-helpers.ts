import {
    AccountTransactionInput,
    AccountTransactionType,
    ContractName,
    EntrypointName,
    getAccountTransactionHandler,
    InitContractInput,
    jsonParse,
    Parameter,
    SchemaVersion,
    serializeInitContractParameters,
    serializeTypeValue,
    serializeUpdateContractParameters,
    SimpleTransferPayload,
    UpdateContractInput,
} from '@concordium/web-sdk';
import { Buffer } from 'buffer/';
import { SchemaType, SchemaWithContext, SmartContractParameters } from '@concordium/browser-wallet-api-helpers';
import { serializationTypes } from '@wallet-api/constants';
import * as JSONBig from 'json-bigint';

export type HeadlessTransaction =
    | { type: AccountTransactionType.Update; payload: UpdateContractInput }
    | { type: AccountTransactionType.Transfer; payload: SimpleTransferPayload }
    | { type: AccountTransactionType.InitContract; payload: InitContractInput }
    | {
          type: Exclude<
              AccountTransactionType,
              AccountTransactionType.Transfer | AccountTransactionType.Update | AccountTransactionType.InitContract
          >;
          payload: Exclude<AccountTransactionInput, UpdateContractInput | InitContractInput | SimpleTransferPayload>;
      };

/**
 * Parse that acts as an inverse for stringify from browser-wallet-api/utils
 */
export function parse(input: string | undefined) {
    if (!input) {
        return undefined;
    }
    return jsonParse(input, (_, v) => {
        if (v) {
            switch (v['@type']) {
                case serializationTypes.BigInt:
                    return BigInt(v.value);
                case serializationTypes.Date:
                    return new Date(v.value);
                case serializationTypes.Buffer:
                    return Buffer.from(v.value, 'base64');
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
    stringifiedParameters?: string,
    schema?: SchemaWithContext,
    schemaVersion: SchemaVersion = 0
): HeadlessTransaction {
    const payloadJSON = parse(stringifiedPayload);
    const handler = getAccountTransactionHandler(type);
    const payload = handler.fromJSON(payloadJSON);
    const parameters =
        stringifiedParameters === undefined
            ? undefined
            : (JSONBig.parse(stringifiedParameters) as SmartContractParameters);

    switch (type) {
        case AccountTransactionType.Update: {
            const updatePayload = payload as UpdateContractInput;
            const [contractName, functionName] = updatePayload.receiveName.value.split('.');

            let parameter: Parameter.Type;
            if (parameters === undefined || parameters === null || !schema) {
                parameter = Parameter.empty();
            } else if (schema.type === SchemaType.Module) {
                parameter = serializeUpdateContractParameters(
                    ContractName.fromString(contractName),
                    EntrypointName.fromString(functionName),
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
            const initPayload = payload as InitContractInput;
            let parameter: Parameter.Type;
            if (parameters === undefined || parameters === null || !schema) {
                parameter = Parameter.empty();
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
        case AccountTransactionType.Transfer:
            return {
                type,
                payload: payload as SimpleTransferPayload,
            };
        default:
            return {
                type,
                payload,
            } as HeadlessTransaction;
    }
}
