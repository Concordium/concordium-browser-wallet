/* eslint-disable @typescript-eslint/no-explicit-any */
import { Buffer } from 'buffer/';
import {
    SmartContractParameters,
    SchemaWithContext,
    SchemaType,
    AccountAddressSource,
    SchemaSource,
    SignMessageObject,
} from '@concordium/browser-wallet-api-helpers';
import {
    AccountAddress,
    AccountTransactionPayload,
    AccountTransactionType,
    CcdAmount,
    ConfigureBakerPayload,
    ConfigureDelegationPayload,
    ContractAddress,
    ContractName,
    DeployModulePayload,
    Energy,
    HexString,
    IdStatement,
    InitContractPayload,
    ModuleReference,
    Parameter,
    ReceiveName,
    SchemaVersion,
    SimpleTransferPayload,
    UpdateContractPayload,
} from '@concordium/web-sdk';

type GtuAmount = { microGtuAmount: bigint };

/**
 * Used in versions released prior to coin being renamed to CCD.
 */
export function isGtuAmount(cand: any): cand is GtuAmount {
    return cand && typeof cand.microGtuAmount === 'bigint';
}

function sanitizeAccountAddress(accountAddress: AccountAddressSource): AccountAddress.Type {
    return AccountAddress.instanceOf(accountAddress) ? accountAddress : AccountAddress.fromBase58(accountAddress);
}

type SanitizedSignMessageInput = {
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

type SanitizedRequestIdProofInput = {
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

type SanitizedAddCIS2TokensInput = {
    accountAddress: AccountAddress.Type;
    tokenIds: string[];
    contractAddress: ContractAddress.Type;
};

export function sanitizeAddCIS2TokensInput(
    _accountAddress: AccountAddressSource,
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

interface CcdAmountV0 {
    readonly microCcdAmount: bigint;
}

interface ContractAddressV0 {
    index: bigint;
    subindex: bigint;
}

interface AccountAddressV0 {
    readonly address: HexString;
    readonly decodedAddress: Uint8Array;
}

interface ModuleReferenceV0 {
    readonly moduleRef: HexString;
    readonly decodedModuleRef: Uint8Array;
}

interface InitContractPayloadV0 {
    amount: CcdAmountV0;
    moduleRef: ModuleReferenceV0;
    contractName: string;
    param?: Buffer;
    maxContractExecutionEnergy: bigint;
}

interface InitContractPayloadV1 {
    amount: CcdAmountV0;
    moduleRef: ModuleReferenceV0;
    initName: string;
    param?: Buffer;
    maxContractExecutionEnergy: bigint;
}

type InitContractPayloadCompat = InitContractPayloadV0 | InitContractPayloadV1 | InitContractPayload;

interface UpdateContractPayloadV0 {
    amount: CcdAmountV0;
    contractAddress: ContractAddressV0;
    receiveName: string;
    message?: Buffer;
    maxContractExecutionEnergy: bigint;
}

interface UpdateContractPayloadV1 {
    amount: CcdAmountV0;
    address: ContractAddressV0;
    receiveName: string;
    message?: Buffer;
    maxContractExecutionEnergy: bigint;
}

type UpdateContractPayloadCompat = UpdateContractPayloadV0 | UpdateContractPayloadV1 | UpdateContractPayload;

interface DeployModulePayloadV0 {
    version?: number;
    content: Uint8Array;
}

type DeployModulePayloadCompat = DeployModulePayloadV0 | DeployModulePayload;

interface SimpleTransferPayloadV0 {
    amount: CcdAmountV0;
    toAddress: AccountAddressV0;
}

type SimpleTransferPayloadCompat = SimpleTransferPayloadV0 | SimpleTransferPayload;

interface ConfigureBakerPayloadV0 extends Omit<ConfigureBakerPayload, 'stake'> {
    stake?: CcdAmountV0;
}

type ConfigureBakerPayloadCompat = ConfigureBakerPayloadV0 | ConfigureBakerPayload;

interface ConfigureDelegationPayloadV0 extends Omit<ConfigureDelegationPayload, 'stake'> {
    stake?: CcdAmountV0;
}

type ConfigureDelegationPayloadCompat = ConfigureDelegationPayloadV0 | ConfigureDelegationPayload;

type SanitizedSendTransactionInput = {
    accountAddress: AccountAddress.Type;
    type: AccountTransactionType;
    payload: AccountTransactionPayload;
    parameters?: SmartContractParameters;
    schema?: SchemaWithContext;
    schemaVersion?: SchemaVersion;
};

function sanitizePayload(type: AccountTransactionType, payload: AccountTransactionPayload): AccountTransactionPayload {
    switch (type) {
        case AccountTransactionType.InitContract: {
            const p = payload as InitContractPayloadCompat;

            const amount = CcdAmount.fromMicroCcd(p.amount.microCcdAmount);
            const moduleRef = ModuleReference.fromHexString(p.moduleRef.moduleRef);
            const initName =
                typeof (p as InitContractPayload).initName !== 'string'
                    ? (p as InitContractPayload).initName
                    : ContractName.fromString(
                          (p as InitContractPayloadV0).contractName ?? (p as InitContractPayloadV1).initName
                      );
            const maxContractExecutionEnergy =
                typeof p.maxContractExecutionEnergy !== 'bigint'
                    ? p.maxContractExecutionEnergy
                    : Energy.create(p.maxContractExecutionEnergy);

            let param: Parameter.Type | undefined;
            if (p.param === undefined) {
                param = undefined;
            } else if (p.param instanceof Uint8Array) {
                param = Parameter.fromBuffer(p.param);
            } else {
                param = p.param;
            }

            return {
                amount,
                moduleRef,
                param,
                initName,
                maxContractExecutionEnergy,
            } as InitContractPayload;
        }
        case AccountTransactionType.Update: {
            const p = payload as UpdateContractPayloadCompat;

            const amount = CcdAmount.fromMicroCcd(p.amount.microCcdAmount);
            const maxContractExecutionEnergy =
                typeof p.maxContractExecutionEnergy !== 'bigint'
                    ? p.maxContractExecutionEnergy
                    : Energy.create(p.maxContractExecutionEnergy);
            const receiveName =
                typeof p.receiveName === 'string' ? ReceiveName.fromString(p.receiveName) : p.receiveName;

            const { index, subindex } =
                (p as UpdateContractPayloadV1 | UpdateContractPayload).address ??
                (p as UpdateContractPayloadV0).contractAddress;
            const address = ContractAddress.create(index, subindex);

            let message: Parameter.Type | undefined;
            if (p.message === undefined) {
                message = undefined;
            } else if (p.message instanceof Uint8Array) {
                message = Parameter.fromBuffer(p.message);
            } else {
                message = p.message;
            }

            return {
                amount,
                address,
                message,
                receiveName,
                maxContractExecutionEnergy,
            } as UpdateContractPayload;
        }
        case AccountTransactionType.DeployModule: {
            const p = payload as DeployModulePayloadCompat;
            const source = (p as DeployModulePayloadV0).content ?? (p as DeployModulePayload).source;

            return {
                version: p.version,
                source,
            } as DeployModulePayload;
        }
        case AccountTransactionType.Transfer:
        case AccountTransactionType.TransferWithMemo: {
            const p = payload as SimpleTransferPayloadCompat;

            const amount = CcdAmount.fromMicroCcd(p.amount.microCcdAmount);
            const toAddress = AccountAddress.fromBuffer(p.toAddress.decodedAddress);

            return { ...p, amount, toAddress };
        }
        case AccountTransactionType.ConfigureBaker:
        case AccountTransactionType.ConfigureDelegation: {
            const p = payload as ConfigureBakerPayloadCompat | ConfigureDelegationPayloadCompat;
            const stake = p.stake !== undefined ? CcdAmount.fromMicroCcd(p.stake.microCcdAmount) : undefined;
            return { ...p, stake };
        }
        default:
            return payload;
    }
}

/**
 * Compatibility layer for `WalletApi.sendTransaction`
 */
export function sanitizeSendTransactionInput(
    _accountAddress: AccountAddressSource,
    type: AccountTransactionType,
    _payload: AccountTransactionPayload,
    parameters?: SmartContractParameters,
    _schema?: SchemaSource,
    schemaVersion?: SchemaVersion
): SanitizedSendTransactionInput {
    const accountAddress = sanitizeAccountAddress(_accountAddress);
    const payload = sanitizePayload(type, _payload);

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
