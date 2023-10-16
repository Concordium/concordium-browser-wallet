/* eslint-disable @typescript-eslint/no-explicit-any */
import { Buffer } from 'buffer/';
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
    param: Buffer;
    maxContractExecutionEnergy: bigint;
}

interface InitContractPayloadV1 {
    amount: CcdAmountV0;
    moduleRef: ModuleReferenceV0;
    initName: string;
    param: Buffer;
    maxContractExecutionEnergy: bigint;
}

type InitContractPayloadCompat = InitContractPayloadV0 | InitContractPayloadV1 | InitContractPayload;

const isInitContractPayloadV0 = (p: InitContractPayloadCompat): p is InitContractPayloadV0 =>
    typeof (p as InitContractPayloadV0).contractName === 'string';
const isInitContractPayloadV1 = (p: InitContractPayloadCompat): p is InitContractPayloadV1 =>
    typeof (p as InitContractPayloadV1).initName === 'string' && typeof p.maxContractExecutionEnergy === 'bigint';
const isInitContractPayloadCurrent = (p: InitContractPayloadCompat): p is InitContractPayload =>
    Parameter.instanceOf(p.param);

interface UpdateContractPayloadV0 {
    amount: CcdAmountV0;
    contractAddress: ContractAddressV0;
    receiveName: string;
    message: Buffer;
    maxContractExecutionEnergy: bigint;
}

interface UpdateContractPayloadV1 {
    amount: CcdAmountV0;
    address: ContractAddressV0;
    receiveName: string;
    message: Buffer;
    maxContractExecutionEnergy: bigint;
}

type UpdateContractPayloadCompat = UpdateContractPayloadV0 | UpdateContractPayloadV1 | UpdateContractPayload;

const isUpdateContractPayloadV0 = (p: UpdateContractPayloadCompat): p is UpdateContractPayloadV0 =>
    (p as UpdateContractPayloadV0).contractAddress !== undefined;
const isUpdateContractPayloadV1 = (p: UpdateContractPayloadCompat): p is UpdateContractPayloadV1 =>
    (p as UpdateContractPayloadV1).address !== undefined && typeof p.maxContractExecutionEnergy === 'bigint';
const isUpdateContractPayloadCurrent = (p: UpdateContractPayloadCompat): p is UpdateContractPayload =>
    Parameter.instanceOf(p.message) && ContractAddress.instanceOf((p as UpdateContractPayload).address);

interface DeployModulePayloadV0 {
    version?: number;
    content: Uint8Array;
}

type DeployModulePayloadCompat = DeployModulePayloadV0 | DeployModulePayload;

const isDeployModulePayloadV0 = (p: DeployModulePayloadCompat): p is DeployModulePayloadV0 =>
    (p as DeployModulePayloadV0).content !== undefined;
const isDeployModulePayloadCurrent = (p: DeployModulePayloadCompat): p is DeployModulePayload =>
    (p as DeployModulePayload).source !== undefined;

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

            const amount: CcdAmount.Type = CcdAmount.fromMicroCcd(p.amount.microCcdAmount);
            const moduleRef: ModuleReference.Type = ModuleReference.fromHexString(p.moduleRef.moduleRef);
            let initName: ContractName.Type;
            let maxContractExecutionEnergy: Energy.Type;
            let param: Parameter.Type | undefined;

            if (isInitContractPayloadV0(p)) {
                initName = ContractName.fromString(p.contractName);
                maxContractExecutionEnergy = Energy.create(p.maxContractExecutionEnergy);
                param = p.param !== undefined ? Parameter.fromBuffer(p.param) : undefined;
            } else if (isInitContractPayloadV1(p)) {
                initName = ContractName.fromString(p.initName);
                maxContractExecutionEnergy = Energy.create(p.maxContractExecutionEnergy);
                param = p.param !== undefined ? Parameter.fromBuffer(p.param) : undefined;
            } else if (isInitContractPayloadCurrent(p)) {
                return p;
            } else {
                throw new Error(`Could not sanitize payload as type "${type}": ${p}`);
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

            const amount: CcdAmount.Type = CcdAmount.fromMicroCcd(p.amount.microCcdAmount);
            let maxContractExecutionEnergy: Energy.Type;
            let message: Parameter.Type | undefined;
            let address: ContractAddress.Type;
            let receiveName: ReceiveName.Type;

            if (isUpdateContractPayloadV0(p)) {
                address = ContractAddress.create(p.contractAddress.index, p.contractAddress.subindex);
                maxContractExecutionEnergy = Energy.create(p.maxContractExecutionEnergy);
                message = p.message !== undefined ? Parameter.fromBuffer(p.message) : undefined;
                receiveName = ReceiveName.fromString(p.receiveName);
            } else if (isUpdateContractPayloadV1(p)) {
                address = ContractAddress.create(p.address.index, p.address.subindex);
                maxContractExecutionEnergy = Energy.create(p.maxContractExecutionEnergy);
                message = p.message !== undefined ? Parameter.fromBuffer(p.message) : undefined;
                receiveName = ReceiveName.fromString(p.receiveName);
            } else if (isUpdateContractPayloadCurrent(p)) {
                return p;
            } else {
                throw new Error(`Could not sanitize payload as type "${type}": ${p}`);
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

            let source: Uint8Array;

            if (isDeployModulePayloadV0(p)) {
                source = p.content;
            } else if (isDeployModulePayloadCurrent(p)) {
                return p;
            } else {
                throw new Error(`Could not sanitize payload as type "${type}": ${p}`);
            }

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
    _accountAddress: AccountAddressLike,
    type: AccountTransactionType,
    _payload: AccountTransactionPayload,
    parameters?: SmartContractParameters,
    _schema?: SchemaLike,
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
