/* eslint-disable @typescript-eslint/no-explicit-any */

import {
    SmartContractParameters,
    SchemaWithContext,
    SchemaType,
    AccountAddressLike,
    SchemaLike,
    SignMessageObject,
} from '@concordium/browser-wallet-api-helpers';
import {
    AccountAddress,
    AccountTransactionPayload,
    AccountTransactionType,
    ContractAddress,
    DeployModulePayload,
    IdStatement,
    InitContractPayload,
    SchemaVersion,
    UpdateContractPayload,
} from '@concordium/web-sdk';

type GtuAmount = { microGtuAmount: bigint };

/**
 * Used in versions released prior to coin being renamed to CCD.
 */
export function isGtuAmount(cand: any): cand is GtuAmount {
    return cand && typeof cand.microGtuAmount === 'bigint';
}

function sanitizeAccountAddress(accountAddress: AccountAddressLike): AccountAddress.Type {
    return AccountAddress.instanceOf(accountAddress) ? accountAddress : AccountAddress.fromBase58(accountAddress);
}

type SanitizedSignMessageInput = {
    accountAddress: AccountAddress.Type;
    message: string | SignMessageObject;
};

export function sanitizeSignMessageInput(
    accountAddress: AccountAddressLike,
    message: string | SignMessageObject
): SanitizedSignMessageInput {
    return {
        accountAddress: sanitizeAccountAddress(accountAddress),
        message,
    };
}

type SanitizedRequestIdProofInput = {
    accountAddress: AccountAddress.Type;
    statement: IdStatement;
    challenge: string;
};

export function sanitizeRequestIdProofInput(
    accountAddress: AccountAddressLike,
    statement: IdStatement,
    challenge: string
): SanitizedRequestIdProofInput {
    return {
        accountAddress: sanitizeAccountAddress(accountAddress),
        statement,
        challenge,
    };
}

type SanitizedAddCIS2TokensInput = {
    accountAddress: AccountAddress.Type;
    tokenIds: string[];
    contractAddress: ContractAddress.Type;
};

export function sanitizeAddCIS2TokensInput(
    _accountAddress: AccountAddressLike,
    tokenIds: string[],
    dyn: ContractAddress.Type | bigint,
    contractSubindex?: bigint
): SanitizedAddCIS2TokensInput {
    const accountAddress = sanitizeAccountAddress(_accountAddress);
    let contractAddress: ContractAddress.Type;
    if (ContractAddress.instanceOf(dyn)) {
        contractAddress = dyn;
    } else {
        contractAddress = ContractAddress.create(dyn, contractSubindex);
    }

    return { accountAddress, tokenIds, contractAddress };
}

type SanitizedSendTransactionInput = {
    accountAddress: AccountAddress.Type;
    type: AccountTransactionType;
    payload: AccountTransactionPayload;
    parameters?: SmartContractParameters;
    schema?: SchemaWithContext;
    schemaVersion?: SchemaVersion;
};

/**
 * Compatibility layer for `WalletApi.sendTransaction`
 */
export function sanitizeSendTransactionInput(
    _accountAddress: AccountAddressLike,
    type: AccountTransactionType,
    _payload: AccountTransactionPayload,
    parameters?: SmartContractParameters,
    _schema?: SchemaLike,
    schemaVersion?: SchemaVersion
): SanitizedSendTransactionInput {
    const accountAddress = sanitizeAccountAddress(_accountAddress);

    let payload = _payload;
    if (type === AccountTransactionType.InitContract) {
        const initPayload: InitContractPayload = {
            ...(_payload as InitContractPayload),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            initName: (_payload as InitContractPayload).initName || (_payload as any).contractName,
        };
        payload = initPayload;
    } else if (type === AccountTransactionType.Update) {
        const updatePayload: UpdateContractPayload = {
            ...(_payload as UpdateContractPayload),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            address: (_payload as UpdateContractPayload).address || (_payload as any).contractAddress,
        };
        payload = updatePayload;
    } else if (type === AccountTransactionType.DeployModule) {
        const deployPayload: DeployModulePayload = {
            ...(_payload as DeployModulePayload),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            source: (_payload as DeployModulePayload).source || (_payload as any).content,
        };
        payload = deployPayload;
    }

    let schema: SchemaWithContext | undefined;
    if (typeof _schema === 'string' || _schema instanceof String) {
        schema = {
            type: SchemaType.Module,
            value: _schema.toString(),
        };
    } else {
        schema = _schema;
    }

    return { accountAddress, type, payload, parameters, schema, schemaVersion };
}
