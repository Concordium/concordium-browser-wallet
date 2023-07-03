import { ConcordiumGRPCClient, ContractAddress } from '@concordium/web-sdk';
import { VerifiableCredentialStatus } from '@shared/storage/types';
import { Buffer } from 'buffer/';
import * as ed from '@noble/ed25519';

export async function sign(digest: Buffer, privateKey: string) {
    return Buffer.from(await ed.signAsync(digest, privateKey)).toString('hex');
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

export function serializeRevokeCredentialHolderParam(parameter: RevokeCredentialHolderParam) {
    let buffer = Buffer.from(parameter.signature, 'hex');
    buffer = Buffer.concat([buffer, Buffer.from(parameter.data.credentialId, 'hex')]);

    // TODO Fix BigInt issue here.
    const addressBuffer = Buffer.alloc(16);
    addressBuffer.writeBigUInt64LE(parameter.data.signingData.contractAddress.index, 0);
    addressBuffer.writeBigUInt64LE(parameter.data.signingData.contractAddress.subindex, 8);

    const serializedEntryPointName = Buffer.from(parameter.data.signingData.entryPoint, 'utf-8');
    let entryPointSerialization = Buffer.alloc(2);
    entryPointSerialization.writeUInt16LE(serializedEntryPointName.length, 0);
    entryPointSerialization = Buffer.concat([entryPointSerialization, serializedEntryPointName]);

    const finalBuffer = Buffer.alloc(16);
    finalBuffer.writeBigUInt64LE(parameter.data.signingData.nonce, 0);
    finalBuffer.writeBigUInt64LE(parameter.data.signingData.timestamp, 8);

    return Buffer.concat([buffer, addressBuffer, entryPointSerialization, finalBuffer, Buffer.of(0)]);
}

/**
 *     contractAddress: ContractAddress;
    entryPoint: string;
    nonce: BigInt;
    timestamp: BigInt;
 */

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
