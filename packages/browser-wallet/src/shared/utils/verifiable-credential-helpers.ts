import { ConcordiumGRPCClient, ContractAddress } from '@concordium/web-sdk';
import { MetadataUrl, VerifiableCredentialSchema, VerifiableCredentialStatus } from '@shared/storage/types';
import { Buffer } from 'buffer/';
import { getContractName } from './contract-helpers';

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
 * @param credentialId the id for a verifiable credential
 * @throws an error if the invoke contract call fails, or if no return value is available
 * @returns the status of the verifiable credential, the status will be unknown if the contract is not found
 */
export async function getVerifiableCredentialStatus(client: ConcordiumGRPCClient, credentialId: string) {
    const contractAddress = getCredentialRegistryContractAddress(credentialId);
    const instanceInfo = await client.getInstanceInfo(contractAddress);
    if (instanceInfo === undefined) {
        return VerifiableCredentialStatus.Unknown;
    }

    const result = await client.invokeContract({
        contract: contractAddress,
        method: `${instanceInfo.name.substring(5)}.credentialStatus`,
        parameter: Buffer.from(getCredentialHolderId(credentialId), 'hex'),
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

export interface SchemaRef {
    schema: MetadataUrl;
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

export interface RegistryMetadata {
    issuerMetadata: MetadataUrl;
    credentialType: string;
    credentialSchema: SchemaRef;
}

interface MetadataResponse {
    issuerMetadata: MetadataUrl;
    credentialType: string;
    credentialSchema: SchemaRef;
}

function deserializeRegistryMetadata(serializedRegistryMetadata: string): MetadataResponse {
    const buffer = Buffer.from(serializedRegistryMetadata, 'hex');
    let offset = 0;

    const issuerMetadata = deserializeUrlChecksumPair(buffer, offset);
    offset = issuerMetadata.offset;

    const typeLength = buffer.readInt8(offset);
    offset += 1;
    const credentialType = buffer.toString('utf-8', offset, offset + typeLength);
    offset += typeLength;

    const credentialSchema = deserializeUrlChecksumPair(buffer, offset);

    return {
        issuerMetadata: { url: issuerMetadata.url, hash: issuerMetadata.checksum },
        credentialType,
        credentialSchema: {
            schema: { url: credentialSchema.url, hash: credentialSchema.checksum },
        },
    };
}

/**
 * Get the registry metadata from a credential registry CIS-4 contract.
 * @param client the GRPC client for accessing a node
 * @param contractAddress the address of a CIS-4 contract
 * @returns the registry metadata for the contract, or undefined if the contract instance was not found
 */
export async function getCredentialRegistryMetadata(client: ConcordiumGRPCClient, contractAddress: ContractAddress) {
    const instanceInfo = await client.getInstanceInfo(contractAddress);
    if (instanceInfo === undefined) {
        return undefined;
    }

    const result = await client.invokeContract({
        contract: contractAddress,
        method: `${getContractName(instanceInfo)}.registryMetadata`,
    });

    if (result.tag !== 'success') {
        throw new Error(result.reason.tag);
    }

    const { returnValue } = result;
    if (returnValue === undefined) {
        throw new Error(`Return value is missing from credentialStatus result in CIS-4 contract: ${contractAddress}`);
    }

    return deserializeRegistryMetadata(returnValue);
}

/**
 * Retrieves a credential schema from the specified URL.
 * @param metadata containing the URL and optionally the checksum of the JSON content served at the URL.
 * @throws if the URL is unavailable
 * @throws if the content served at the URL is not valid JSON
 * @throws if the JSON served at the URL is not a valid verifiable credential schema
 * @returns a credential schema
 */
export async function getCredentialSchema(
    metadata: MetadataUrl,
    abortController: AbortController
): Promise<VerifiableCredentialSchema> {
    const response = await fetch(metadata.url, {
        headers: new Headers({ 'Access-Control-Allow-Origin': '*' }),
        mode: 'cors',
        signal: abortController.signal,
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch the schema at: ${metadata.url}`);
    }

    // TODO Validate the checksum here.
    const body = Buffer.from(await response.arrayBuffer());
    let bodyAsString;
    try {
        bodyAsString = body.toString();
        const schema = JSON.parse(bodyAsString);

        // TODO Validate that the expected fields are available.
        return schema;
    } catch {
        throw new Error(`Failed to parse JSON: ${bodyAsString}`);
    }
}

// {
//     "title": "Concordium Employment",
//     "logo" : {
//       "url":  "https://concordium.com/wp-content/uploads/2022/07/Concordium-1.png",
//       "hash": "1c74f7eb1b3343a5834e60e9a8fce277f2c7553112accd42e63fae7a09e0caf8"
//       }
//     "background_color": "#000000",
//     "image": {
//       "url": "https://concordium.com/employment/vc-background.png",
//     }
//     "localization": {
//       "da-DK": {
//         "url": "https://location.of/the/danish/metadata.json",
//         "hash": "624a1a7e51f7a87effbf8261426cb7d436cf597be327ebbf113e62cb7814a34b"
//       }
//     }
//   }

export interface VerifiableCredentialMetadata {
    title: string;
    logo: MetadataUrl;
    backgroundColor: string;
    image: MetadataUrl;
    localization?: Record<string, MetadataUrl>;
}

export interface CredentialInfo {
    credentialHolderId: string;
    holderRevocable: boolean;
    validFrom: bigint;
    validUntil?: bigint;
    metadataUrl: MetadataUrl;
}

export interface CredentialQueryResponse {
    credentialInfo: CredentialInfo;
    schemaRef: SchemaRef;
    revocationNonce: bigint;
}

/**
 * Deserializes a CredentialEntry according to the CIS-4 specification.
 * @param serializedCredentialEntry a serialized credential entry as a hex string
 */
export function deserializeCredentialEntry(serializedCredentialEntry: string): CredentialQueryResponse {
    const buffer = Buffer.from(serializedCredentialEntry, 'hex');
    let offset = 0;

    const credentialHolderId = buffer.toString('hex', offset, offset + 32);
    offset += 32;

    const holderRevocable = Boolean(buffer.readUInt8(offset));
    offset += 1;

    const validFrom = buffer.readBigUInt64LE(offset) as bigint;
    offset += 8;

    const containsValidUntil = Boolean(buffer.readUInt8(offset));
    offset += 1;

    let validUntil: bigint | undefined;
    if (containsValidUntil) {
        validUntil = buffer.readBigUInt64LE(offset) as bigint;
        offset += 8;
    }

    const metadata = deserializeUrlChecksumPair(buffer, offset);
    offset = metadata.offset;

    const schema = deserializeUrlChecksumPair(buffer, offset);
    offset = schema.offset;

    const revocationNonce = buffer.readBigInt64LE(offset) as bigint;
    offset += 8;

    return {
        credentialInfo: {
            credentialHolderId,
            holderRevocable,
            validFrom,
            validUntil,
            metadataUrl: { url: metadata.url, hash: metadata.checksum },
        },
        schemaRef: {
            schema: { url: schema.url, hash: schema.checksum },
        },
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

// TODO This method is almost identical to getting credential schema. Share
// the code instead. Only the verification of the type differs.
/**
 * Retrieves credential metadata from the specified URL.
 */
export async function getCredentialMetadata(
    metadata: MetadataUrl,
    abortController: AbortController
): Promise<VerifiableCredentialMetadata> {
    const response = await fetch(metadata.url, {
        headers: new Headers({ 'Access-Control-Allow-Origin': '*' }),
        mode: 'cors',
        signal: abortController.signal,
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch the schema at: ${metadata.url}`);
    }

    // TODO Validate the checksum here.
    const body = Buffer.from(await response.arrayBuffer());
    let bodyAsString;
    try {
        bodyAsString = body.toString();
        const schema = JSON.parse(bodyAsString);

        // TODO Validate that the expected fields are available.
        return schema;
    } catch {
        throw new Error(`Failed to parse JSON: ${bodyAsString}`);
    }
}
