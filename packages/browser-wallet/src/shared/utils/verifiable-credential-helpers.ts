import { CcdAmount, ConcordiumGRPCClient, ContractAddress, UpdateContractPayload } from '@concordium/web-sdk';
import { VerifiableCredentialStatus } from '@shared/storage/types';
import { Buffer } from 'buffer/';
import * as ed from '@noble/ed25519';

/**
 * Extracts the credential holder id from a verifiable credential id (did).
 * @param credentialId the did for a credential
 * @returns the credential holder id
 */
export function getCredentialHolderId(credentialId: string): string {
    const splitted = credentialId.split('/');
    const credentialHolderId = splitted[splitted.length - 1];

    if (credentialHolderId.length !== 64) {
        throw new Error(`Invalid credential holder id found from: ${credentialId}`);
    }

    return credentialHolderId;
}

/**
 * Extracts the credential registry contract addres from a verifiable credential id (did).
 * @param credentialId the did for a credential
 * @returns the contract address of the issuing contract of the provided credential id
 */
export function getCredentialRegistryContractAddress(credentialId: string): ContractAddress {
    const splitted = credentialId.split(':');
    const index = BigInt(splitted[4]);
    const subindex = BigInt(splitted[5].split('/')[0]);
    return { index, subindex };
}

export async function sign(digest: Buffer, privateKey: string) {
    return Buffer.from(await ed.sign(digest, privateKey)).toString('hex');
}

// TODO This function is a copy from the node-sdk. Remove the duplicate here and export it in the SDK to use instead.
export function encodeWord64LE(value: bigint): Buffer {
    if (value > 18446744073709551615n || value < 0n) {
        throw new Error(`The input has to be a 64 bit unsigned integer but it was: ${value}`);
    }
    const arr = new ArrayBuffer(8);
    const view = new DataView(arr);
    view.setBigUint64(0, value, true);
    return Buffer.from(new Uint8Array(arr));
}

export interface SigningData {
    contractAddress: ContractAddress;
    entryPoint: string;
    nonce: bigint;
    timestamp: bigint;
}

export interface RevocationDataHolder {
    /** The public key identifying the credential holder */
    credentialId: string;
    /** Metadata of the signature */
    signingData: SigningData;
}

export interface RevokeCredentialHolderParam {
    /** Ed25519 signature on the revocation message as a hex string */
    signature: string;
    /** Revocation data */
    data: RevocationDataHolder;
}

/**
 * Serializes the revocation data holder. This is the data that is signed, together with a prefix, to authorize
 * the revocation of a held credential.
 * @param data the revocation data context to serialize
 * @returns the serialized revocation data holder
 */
function serializeRevocationDataHolder(data: RevocationDataHolder) {
    const credentialId = Buffer.from(data.credentialId, 'hex');

    const contractIndex = encodeWord64LE(data.signingData.contractAddress.index);
    const contractSubindex = encodeWord64LE(data.signingData.contractAddress.subindex);

    const entrypointName = Buffer.from(data.signingData.entryPoint, 'utf-8');
    const entrypointLength = Buffer.alloc(2);
    entrypointLength.writeUInt16LE(entrypointName.length, 0);

    const nonce = encodeWord64LE(data.signingData.nonce);
    const timestamp = encodeWord64LE(data.signingData.timestamp);

    const optionalReason = Buffer.of(0);

    return Buffer.concat([
        credentialId,
        contractIndex,
        contractSubindex,
        entrypointLength,
        entrypointName,
        nonce,
        timestamp,
        optionalReason,
    ]);
}

export function serializeRevokeCredentialHolderParam(parameter: RevokeCredentialHolderParam) {
    const signature = Buffer.from(parameter.signature, 'hex');
    const data = serializeRevocationDataHolder(parameter.data);
    return Buffer.concat([signature, data]);
}

/**
 * Builds the parameters used for a holder revocation transaction to revoke a given credential in a CIS-4 contract.
 * @param address the address of the contract that hte credential to revoke is registered in
 * @param credentialId the id of the credential to revoke (this is a derived public key)
 * @param nonce the revocation nonce
 * @param signingKey the signing key associated with the credential (the private key to the {@link credentialId})
 * @returns the unserialized parameters for a holder revocation transaction
 */
export async function buildRevokeTransactionParameters(
    address: ContractAddress,
    credentialId: string,
    nonce: bigint,
    signingKey: string
) {
    const signingData: SigningData = {
        contractAddress: address,
        entryPoint: 'revokeCredentialHolder',
        nonce,
        timestamp: BigInt(Date.now() + 5 * 60000),
    };

    const data: RevocationDataHolder = {
        credentialId,
        signingData,
    };

    const REVOKE_SIGNATURE_MESSAGE = 'WEB3ID:REVOKE';
    const serializedData = serializeRevocationDataHolder(data);
    const signature = await sign(
        Buffer.concat([Buffer.from(REVOKE_SIGNATURE_MESSAGE, 'utf-8'), serializedData]),
        signingKey
    );

    const parameter: RevokeCredentialHolderParam = {
        signature,
        data,
    };

    return parameter;
}

/**
 * Builds a holder revocation transaction to revoke a given verifiable credential in a CIS-4 contract.
 * @param address the address of the contract that the credential to revoke is registered in
 * @param contractName the name of the contract at {@link address}
 * @param credentialId the id of the credential to revoke
 * @param maxContractExecutionEnergy the maximum contract execution energy
 * @returns an update contract transaction for revoking the credential with id {@link credentialId}
 */
export async function buildRevokeTransaction(
    address: ContractAddress,
    contractName: string,
    credentialId: string,
    maxContractExecutionEnergy: bigint,
    parameters: RevokeCredentialHolderParam
): Promise<UpdateContractPayload> {
    return {
        address,
        amount: new CcdAmount(0n),
        receiveName: `${contractName}.revokeCredentialHolder`,
        maxContractExecutionEnergy,
        message: serializeRevokeCredentialHolderParam(parameters),
    };
}

function deserializeCredentialStatus(serializedCredentialStatus: string): VerifiableCredentialStatus {
    const buff = Buffer.from(serializedCredentialStatus, 'hex');
    switch (buff.readUInt8(0)) {
        case 0:
            return VerifiableCredentialStatus.Active;
        case 1:
            return VerifiableCredentialStatus.Revoked;
        case 2:
            return VerifiableCredentialStatus.Expired;
        case 3:
            return VerifiableCredentialStatus.NotActivated;
        default:
            throw new Error(`Received an invalid credential status: ${serializedCredentialStatus}`);
    }
}

/**
 * Estimates the cost of a holder revocation transaction.
 * @param client the GRPC client for accessing a node
 * @param contractName the name of the contract to invoke to get the estimate
 * @param parameters the unserialized parameters for a holder revocation transaction
 * @returns an estimate of the execution cost of the holder revocation transaction
 */
export async function getRevokeTransactionExecutionEnergyEstimate(
    client: ConcordiumGRPCClient,
    contractName: string,
    parameters: RevokeCredentialHolderParam
) {
    const invokeResult = await client.invokeContract({
        contract: parameters.data.signingData.contractAddress,
        method: `${contractName}.${parameters.data.signingData.entryPoint}`,
        parameter: serializeRevokeCredentialHolderParam(parameters),
    });
    // TODO Use a shared function for the buffer calculation. Also used in token-helpers.
    return (invokeResult.usedEnergy * 12n) / 10n;
}

/**
 * Get the status of a verifiable credential in a CIS-4 contract.
 * @param client the GRPC client for accessing a node
 * @param contractAddress the address of a CIS-4 contract
 * @param credentialHolderId the public key for the credential holder
 * @throws an error if the invoke contract call fails, or if no return value is available
 * @returns the status of the verifiable credential, the status will be unknown if the contract is not found
 */
export async function getVerifiableCredentialStatus(
    client: ConcordiumGRPCClient,
    contractAddress: ContractAddress,
    credentialHolderId: string
) {
    const instanceInfo = await client.getInstanceInfo(contractAddress);
    if (instanceInfo === undefined) {
        return VerifiableCredentialStatus.Unknown;
    }

    const result = await client.invokeContract({
        contract: contractAddress,
        method: `${instanceInfo.name.substring(5)}.credentialStatus`,
        parameter: Buffer.from(credentialHolderId, 'hex'),
    });

    if (result.tag !== 'success') {
        throw new Error(result.reason.tag);
    }

    const { returnValue } = result;
    if (returnValue === undefined) {
        throw new Error(`Return value is missing from credentialStatus result in CIS-4 contract: ${contractAddress}`);
    }

    return deserializeCredentialStatus(returnValue);
}

export interface CredentialEntry {
    credentialHolderId: string;
    holderRevocable: boolean;
    validFrom: bigint;
    validUntil?: bigint;
    credentialType: string;
    metadataUrl: string;
    metadataChecksum?: string;
    schemaUrl: string;
    schemaChecksum?: string;
    revocationNonce: bigint;
}

function deserializeUrlChecksumPair(buffer: Buffer, offset: number) {
    let localOffset = offset;
    const urlLength = buffer.readUInt16LE(localOffset);
    localOffset += 2;

    const url = buffer.toString('utf-8', localOffset, localOffset + urlLength);
    localOffset += urlLength;

    const containsChecksum = buffer.readUInt8(localOffset);
    localOffset += 1;

    let checksum: string | undefined;
    if (containsChecksum) {
        checksum = buffer.toString('hex', localOffset, localOffset + 32);
        localOffset += 32;
    }

    return {
        url,
        checksum,
        offset: localOffset,
    };
}

/**
 * Deserializes a CredentialEntry according to the CIS-4 specification.
 * @param serializedCredentialEntry a serialized credential entry as a hex string
 */
export function deserializeCredentialEntry(serializedCredentialEntry: string): CredentialEntry {
    const buffer = Buffer.from(serializedCredentialEntry, 'hex');
    let offset = 0;

    const credentialHolderId = buffer.toString('hex', offset, offset + 32);
    offset += 32;

    const holderRevocable = Boolean(buffer.readUInt8(offset));
    offset += 1;

    // TODO Remove this as the commitments are moving out of the contract.
    const commitmentLength = buffer.readUInt16LE(offset);
    offset += 2 + commitmentLength;
    // TODO Remove until here.

    const validFrom = buffer.readBigUInt64LE(offset) as bigint;
    offset += 8;

    const containsValidUntil = Boolean(buffer.readUInt8(offset));
    offset += 1;

    let validUntil: bigint | undefined;
    if (containsValidUntil) {
        validUntil = buffer.readBigUInt64LE(offset) as bigint;
        offset += 8;
    }

    const credentialTypeLength = buffer.readUInt8(offset);
    offset += 1;
    const credentialType = buffer.toString('utf-8', offset, offset + credentialTypeLength);
    offset += credentialTypeLength;

    const metadata = deserializeUrlChecksumPair(buffer, offset);
    offset = metadata.offset;

    const schema = deserializeUrlChecksumPair(buffer, offset);
    offset = schema.offset;

    const revocationNonce = buffer.readBigInt64LE(offset) as bigint;
    offset += 8;

    return {
        credentialHolderId,
        holderRevocable,
        validFrom,
        validUntil,
        credentialType,
        metadataUrl: metadata.url,
        metadataChecksum: metadata.checksum,
        schemaUrl: schema.url,
        schemaChecksum: schema.checksum,
        revocationNonce,
    };
}

/**
 * Get a Credential Entry from a CIS-4 contract.
 * @param client the GRPC client for accessing a node
 * @param contractAddress the address of a CIS-4 contract
 * @param credentialHolderId the public key for the credential holder of the entry to retrieve
 * @throws an error if the invoke contract call fails, or if no return value is available
 * @returns the credential entry which contains data about the credential, undefined if the contract instance is not found
 */
export async function getVerifiableCredentialEntry(
    client: ConcordiumGRPCClient,
    contractAddress: ContractAddress,
    credentialHolderId: string
) {
    const instanceInfo = await client.getInstanceInfo(contractAddress);
    if (instanceInfo === undefined) {
        return undefined;
    }

    const result = await client.invokeContract({
        contract: contractAddress,
        method: `${instanceInfo.name.substring(5)}.credentialEntry`,
        parameter: Buffer.from(credentialHolderId, 'hex'),
    });

    if (result.tag !== 'success') {
        throw new Error(result.reason.tag);
    }

    const { returnValue } = result;
    if (returnValue === undefined) {
        throw new Error(`Return value is missing from credentialEntry result in CIS-4 contract: ${contractAddress}`);
    }

    return deserializeCredentialEntry(returnValue);
}
