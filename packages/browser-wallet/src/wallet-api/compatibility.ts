/* eslint-disable @typescript-eslint/no-explicit-any */
import {
    AccountAddressSource,
    SchemaSource,
    SchemaType,
    SchemaWithContext,
    SendTransactionInitContractPayload,
    SendTransactionPayload,
    SendTransactionUpdateContractPayload,
    SignMessageObject,
    SmartContractParameters,
} from '@concordium/browser-wallet-api-helpers';
import {
    AccountAddress,
    AccountTransactionPayload,
    AccountTransactionPayloadJSON,
    AccountTransactionType,
    CcdAmount,
    ConfigureBakerPayload,
    ConfigureDelegationPayload,
    ContractAddress,
    ContractName,
    DataBlob,
    DeployModulePayload,
    Energy,
    getAccountTransactionHandler,
    HexString,
    InitContractInput,
    ModuleReference,
    ReceiveName,
    RegisterDataPayload,
    SchemaVersion,
    SimpleTransferPayload,
    SimpleTransferWithMemoPayload,
    TokenUpdatePayload,
    UpdateCredentialKeysInput,
    UpdateCredentialsInput,
    UpdateCredentialsPayload,
} from '@concordium/web-sdk/types';
import { empty } from '@concordium/web-sdk/types/Parameter';
import { IdStatement } from '@concordium/web-sdk/id';

export type GtuAmount = { microGtuAmount: bigint };

/**
 * Used in versions released prior to coin being renamed to CCD.
 */
export function isGtuAmount(cand: any): cand is GtuAmount {
    return cand && typeof cand.microGtuAmount === 'bigint';
}

function sanitizeAccountAddress(accountAddress: AccountAddressSource): AccountAddress.Type {
    return typeof accountAddress === 'string'
        ? AccountAddress.fromBase58(accountAddress)
        : AccountAddress.fromBase58(accountAddress.address);
}

export type SanitizedSignMessageInput = {
    accountAddress: AccountAddress.Type;
    message: string | SignMessageObject;
};

export function sanitizeSignMessageInput(
    accountAddress: AccountAddressSource,
    message: string | SignMessageObject
): SanitizedSignMessageInput {
    return {
        accountAddress: sanitizeAccountAddress(accountAddress),
        message,
    };
}

export type SanitizedRequestIdProofInput = {
    accountAddress: AccountAddress.Type;
    statement: IdStatement;
    challenge: string;
};

export function sanitizeRequestIdProofInput(
    accountAddress: AccountAddressSource,
    statement: IdStatement,
    challenge: string
): SanitizedRequestIdProofInput {
    return {
        accountAddress: sanitizeAccountAddress(accountAddress),
        statement,
        challenge,
    };
}

export type SanitizedAddCIS2TokensInput = {
    accountAddress: AccountAddress.Type;
    tokenIds: string[];
    contractAddress: ContractAddress.Type;
};

export function sanitizeAddCIS2TokensInput(
    _accountAddress: AccountAddressSource,
    tokenIds: string[],
    contractAddressSource: ContractAddress.Type | bigint,
    contractSubindex?: bigint
): SanitizedAddCIS2TokensInput {
    const accountAddress = sanitizeAccountAddress(_accountAddress);
    let contractAddress: ContractAddress.Type;
    if (typeof contractAddressSource === 'bigint') {
        contractAddress = ContractAddress.create(contractAddressSource, contractSubindex);
    } else {
        contractAddress = ContractAddress.create(contractAddressSource.index, contractAddressSource.subindex);
    }

    return { accountAddress, tokenIds, contractAddress };
}

export interface CcdAmountV0 {
    readonly microCcdAmount: bigint;
}

export interface ContractAddressV0 {
    index: bigint;
    subindex: bigint;
}

export interface AccountAddressV0 {
    readonly address: HexString;
    readonly decodedAddress: Uint8Array;
}

export interface ModuleReferenceV0 {
    readonly moduleRef: HexString;
    readonly decodedModuleRef: Uint8Array;
}

export interface InitContractPayloadV0 {
    amount: GtuAmount;
    moduleRef: ModuleReferenceV0;
    contractName: string;
    maxContractExecutionEnergy: bigint;
}

export interface InitContractPayloadV1 {
    amount: CcdAmountV0;
    moduleRef: ModuleReferenceV0;
    contractName: string;
    maxContractExecutionEnergy: bigint;
}

export interface InitContractPayloadV2 {
    amount: CcdAmountV0;
    moduleRef: ModuleReferenceV0;
    initName: string;
    maxContractExecutionEnergy: bigint;
}

export type InitContractPayloadCompat =
    | InitContractPayloadV0
    | InitContractPayloadV1
    | InitContractPayloadV2
    | SendTransactionInitContractPayload;

export interface UpdateContractPayloadV0 {
    amount: GtuAmount;
    contractAddress: ContractAddressV0;
    receiveName: string;
    maxContractExecutionEnergy: bigint;
}

export interface UpdateContractPayloadV1 {
    amount: CcdAmountV0;
    contractAddress: ContractAddressV0;
    receiveName: string;
    maxContractExecutionEnergy: bigint;
}

export interface UpdateContractPayloadV2 {
    amount: CcdAmountV0;
    address: ContractAddressV0;
    receiveName: string;
    maxContractExecutionEnergy: bigint;
}

export type UpdateContractPayloadCompat =
    | UpdateContractPayloadV0
    | UpdateContractPayloadV1
    | UpdateContractPayloadV2
    | SendTransactionUpdateContractPayload;

export interface DeployModulePayloadV0 {
    version?: number;
    content: Uint8Array;
}

export type DeployModulePayloadCompat = DeployModulePayloadV0 | DeployModulePayload;

type WithMemo<T> = T & Pick<SimpleTransferWithMemoPayload, 'memo'>;

export interface SimpleTransferPayloadV0 {
    amount: GtuAmount;
    toAddress: AccountAddressV0;
}
export type SimpleTransferWithMemoPayloadV0 = WithMemo<SimpleTransferPayloadV0>;

export interface SimpleTransferPayloadV1 {
    amount: CcdAmountV0;
    toAddress: AccountAddressV0;
}
export type SimpleTransferWithMemoPayloadV1 = WithMemo<SimpleTransferPayloadV1>;

export type SimpleTransferPayloadCompat = SimpleTransferPayloadV0 | SimpleTransferPayloadV1 | SimpleTransferPayload;
export type SimpleTransferWithMemoPayloadCompat =
    | SimpleTransferWithMemoPayloadV0
    | SimpleTransferWithMemoPayloadV1
    | SimpleTransferWithMemoPayload;

export interface ConfigureBakerPayloadV0 extends Omit<ConfigureBakerPayload, 'stake'> {
    stake?: CcdAmountV0;
}

export type ConfigureBakerPayloadCompat = ConfigureBakerPayloadV0 | ConfigureBakerPayload;

export interface ConfigureDelegationPayloadV0 extends Omit<ConfigureDelegationPayload, 'stake'> {
    stake?: CcdAmountV0;
}

export type ConfigureDelegationPayloadCompat = ConfigureDelegationPayloadV0 | ConfigureDelegationPayload;

export type RegisterDataPayloadCompat = RegisterDataPayload;
export type UpdateCredentialsPayloadCompat =
    | UpdateCredentialsPayload
    | UpdateCredentialsInput
    | UpdateCredentialKeysInput;

export type SendTransactionPayloadCompat =
    | InitContractPayloadCompat
    | UpdateContractPayloadCompat
    | DeployModulePayloadCompat
    | SimpleTransferPayloadCompat
    | ConfigureBakerPayloadCompat
    | ConfigureDelegationPayloadCompat
    | RegisterDataPayloadCompat
    | UpdateCredentialsPayloadCompat
    | TokenUpdatePayload;

function sanitizePayload(type: AccountTransactionType, payload: SendTransactionPayloadCompat): SendTransactionPayload {
    switch (type) {
        case AccountTransactionType.InitContract: {
            const p = payload as InitContractPayloadCompat;

            const amount = CcdAmount.fromMicroCcd(
                isGtuAmount(p.amount) ? p.amount.microGtuAmount : p.amount.microCcdAmount
            );
            const moduleRef = ModuleReference.fromHexString(p.moduleRef.moduleRef);

            let initName: ContractName.Type;
            if (typeof (p as InitContractPayloadV0 | InitContractPayloadV1).contractName === 'string') {
                initName = ContractName.fromString((p as InitContractPayloadV0).contractName);
            } else if (typeof (p as InitContractPayloadV2).initName === 'string') {
                initName = ContractName.fromString((p as InitContractPayloadV2).initName);
            } else if (
                typeof (p as InitContractInput).initName === 'object' &&
                (p as InitContractInput).initName !== null
            ) {
                initName = ContractName.fromString((p as InitContractInput).initName.value);
            } else {
                throw new Error(`Unexpected payload for type ${type}: ${p}`);
            }

            const maxContractExecutionEnergy =
                typeof p.maxContractExecutionEnergy !== 'bigint'
                    ? Energy.create(p.maxContractExecutionEnergy.value)
                    : Energy.create(p.maxContractExecutionEnergy);

            return {
                amount,
                moduleRef,
                initName,
                maxContractExecutionEnergy,
            } as SendTransactionInitContractPayload;
        }
        case AccountTransactionType.Update: {
            const p = payload as UpdateContractPayloadCompat;

            const amount = CcdAmount.fromMicroCcd(
                isGtuAmount(p.amount) ? p.amount.microGtuAmount : p.amount.microCcdAmount
            );
            const maxContractExecutionEnergy =
                typeof p.maxContractExecutionEnergy !== 'bigint'
                    ? Energy.create(p.maxContractExecutionEnergy.value)
                    : Energy.create(p.maxContractExecutionEnergy);
            const receiveName =
                typeof p.receiveName === 'string'
                    ? ReceiveName.fromString(p.receiveName)
                    : ReceiveName.fromString(p.receiveName.value);

            const { index, subindex } =
                (p as Exclude<SendTransactionUpdateContractPayload, UpdateContractPayloadV0>).address ??
                (p as UpdateContractPayloadV0).contractAddress;
            const address = ContractAddress.create(index, subindex);

            return {
                amount,
                address,
                receiveName,
                maxContractExecutionEnergy,
            } as SendTransactionUpdateContractPayload;
        }
        case AccountTransactionType.DeployModule: {
            const p = payload as DeployModulePayloadCompat;
            const source = (p as DeployModulePayloadV0).content ?? (p as DeployModulePayload).source;

            return {
                version: p.version,
                source,
            } as DeployModulePayload;
        }
        case AccountTransactionType.Transfer: {
            const p = payload as SimpleTransferPayloadCompat;

            const amount = CcdAmount.fromMicroCcd(
                isGtuAmount(p.amount) ? p.amount.microGtuAmount : p.amount.microCcdAmount
            );
            const toAddress = AccountAddress.fromBuffer(p.toAddress.decodedAddress);

            return { amount, toAddress } as SimpleTransferPayload;
        }
        case AccountTransactionType.TransferWithMemo: {
            const p = payload as SimpleTransferWithMemoPayloadCompat;

            const amount = CcdAmount.fromMicroCcd(
                isGtuAmount(p.amount) ? p.amount.microGtuAmount : p.amount.microCcdAmount
            );
            const toAddress = AccountAddress.fromBuffer(p.toAddress.decodedAddress);

            const memo = new DataBlob(p.memo.data);

            return { amount, toAddress, memo } as SimpleTransferWithMemoPayload;
        }
        case AccountTransactionType.ConfigureBaker:
        case AccountTransactionType.ConfigureDelegation: {
            const p = payload as ConfigureBakerPayloadCompat | ConfigureDelegationPayloadCompat;
            const stake = p.stake !== undefined ? CcdAmount.fromMicroCcd(p.stake.microCcdAmount) : undefined;
            return { ...p, stake } as ConfigureBakerPayload | ConfigureDelegationPayload;
        }
        case AccountTransactionType.RegisterData: {
            const p = payload as RegisterDataPayloadCompat;

            const data = new DataBlob(p.data.data);

            return { data } as RegisterDataPayload;
        }
        case AccountTransactionType.UpdateCredentials:
            // No changes across any API versions.
            return payload as UpdateCredentialsInput;
        default:
            // This should never happen, but is here for backwards compatibility.
            return payload as SendTransactionPayload;
    }
}

export type SanitizedSendTransactionInput = {
    accountAddress: AccountAddress.Type;
    type: AccountTransactionType;
    payload: AccountTransactionPayloadJSON;
    parameters?: SmartContractParameters;
    schema?: SchemaWithContext;
    schemaVersion?: SchemaVersion;
};

/**
 * Compatibility layer for `WalletApi.sendTransaction`
 */
export function sanitizeSendTransactionInput(
    accountAddress: AccountAddressSource,
    type: AccountTransactionType,
    payload: SendTransactionPayloadCompat,
    parameters?: SmartContractParameters,
    schema?: SchemaSource,
    schemaVersion?: SchemaVersion
): SanitizedSendTransactionInput {
    const sanitizedAccountAddress = sanitizeAccountAddress(accountAddress);
    const sanitizedPayload = sanitizePayload(type, payload);

    let accountTransactionPayload: AccountTransactionPayload;
    switch (type) {
        case AccountTransactionType.Update:
            accountTransactionPayload = {
                ...(sanitizedPayload as SendTransactionUpdateContractPayload),
                message: empty(),
            };
            break;
        case AccountTransactionType.InitContract:
            accountTransactionPayload = {
                ...(sanitizedPayload as SendTransactionInitContractPayload),
                param: empty(),
            };
            break;
        default:
            accountTransactionPayload = sanitizedPayload as AccountTransactionPayload;
            break;
    }

    const handler = getAccountTransactionHandler(type);
    const sanitizedPayloadJSON = handler.toJSON(accountTransactionPayload);

    let sanitizedSchema: SchemaWithContext | undefined;
    if (typeof schema === 'string' || schema instanceof String) {
        sanitizedSchema = {
            type: SchemaType.Module,
            value: schema.toString(),
        };
    } else {
        sanitizedSchema = schema;
    }

    return {
        accountAddress: sanitizedAccountAddress,
        type,
        payload: sanitizedPayloadJSON,
        parameters,
        schema: sanitizedSchema,
        schemaVersion,
    };
}
