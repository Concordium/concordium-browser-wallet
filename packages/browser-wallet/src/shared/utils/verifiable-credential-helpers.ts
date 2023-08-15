import { ConcordiumGRPCClient, ContractAddress, sha256 } from '@concordium/web-sdk';
import {
    MetadataUrl,
    NetworkConfiguration,
    VerifiableCredential,
    VerifiableCredentialSchema,
    VerifiableCredentialStatus,
} from '@shared/storage/types';
import { Buffer } from 'buffer/';
import jsonschema from 'jsonschema';
import { getContractName } from './contract-helpers';
import { getNet } from './network-helpers';

/**
 * Extracts the credential holder id from a verifiable credential id (did).
 * @param credentialId the did for a credential
 * @returns the credential holder id
 */
export function getCredentialHolderId(credentialId: string): string {
    const credentialIdParts = credentialId.split('/');
    const credentialHolderId = credentialIdParts[credentialIdParts.length - 1];

    if (credentialHolderId.length !== 64) {
        throw new Error(`Invalid credential holder id found from: ${credentialId}`);
    }

    return credentialHolderId;
}

/** Takes a PublicKey Identifier DID string and returns the public key.
 * @param did a DID string on the form: "did:ccd:NETWORK:pkc:PUBLICKEY"
 * @returns the publicKey PUBLICKEY
 */
export function getPublicKeyfromPublicKeyIdentifierDID(did: string) {
    const didParts = did.split(':');
    if (!(didParts.length === 5 || didParts.length === 4) || didParts[didParts.length - 2] !== 'pkc') {
        throw new Error(`Given DID was not a PublicKey Identifier: ${did}`);
    }
    return didParts[didParts.length - 1];
}

/**
 * Extracts the credential registry contract addres from a verifiable credential id (did).
 * @param credentialId the did for a credential
 * @returns the contract address of the issuing contract of the provided credential id
 */
export function getCredentialRegistryContractAddress(credentialId: string): ContractAddress {
    const credentialIdParts = credentialId.split(':');
    const index = BigInt(credentialIdParts[4]);
    const subindex = BigInt(credentialIdParts[5].split('/')[0]);
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
 * @returns the status of the verifiable credential, the status will be undefined if the contract is not found
 */
export async function getVerifiableCredentialStatus(client: ConcordiumGRPCClient, credentialId: string) {
    const contractAddress = getCredentialRegistryContractAddress(credentialId);
    const instanceInfo = await client.getInstanceInfo(contractAddress);
    if (instanceInfo === undefined) {
        return undefined;
    }

    const result = await client.invokeContract({
        contract: contractAddress,
        method: `${getContractName(instanceInfo)}.credentialStatus`,
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

// The schemas have been generated using ts-json-schema-generator and their
// corresponding type definitions.
const verifiableCredentialSchemaSchema = {
    $ref: '#/definitions/VerifiableCredentialSchema',
    $schema: 'http://json-schema.org/draft-07/schema#',
    definitions: {
        SchemaProperties: {
            additionalProperties: false,
            properties: {
                credentialSubject: {
                    additionalProperties: false,
                    properties: {
                        properties: {
                            additionalProperties: {
                                type: 'object',
                            },
                            properties: {
                                id: {
                                    additionalProperties: false,
                                    properties: {
                                        description: {
                                            type: 'string',
                                        },
                                        title: {
                                            type: 'string',
                                        },
                                        type: {
                                            type: 'string',
                                        },
                                    },
                                    required: ['title', 'type', 'description'],
                                    type: 'object',
                                },
                            },
                            required: ['id'],
                            type: 'object',
                        },
                        required: {
                            items: {
                                type: 'string',
                            },
                            type: 'array',
                        },
                        type: {
                            type: 'string',
                        },
                    },
                    required: ['type', 'required', 'properties'],
                    type: 'object',
                },
            },
            required: ['credentialSubject'],
            type: 'object',
        },
        VerifiableCredentialSchema: {
            additionalProperties: false,
            properties: {
                $id: {
                    type: 'string',
                },
                $schema: {
                    type: 'string',
                },
                description: {
                    type: 'string',
                },
                name: {
                    type: 'string',
                },
                properties: {
                    $ref: '#/definitions/SchemaProperties',
                },
                required: {
                    items: {
                        type: 'string',
                    },
                    type: 'array',
                },
                type: {
                    type: 'string',
                },
            },
            required: ['$id', '$schema', 'name', 'description', 'type', 'properties', 'required'],
            type: 'object',
        },
    },
};

const verifiableCredentialMetadataSchema = {
    $ref: '#/definitions/VerifiableCredentialMetadata',
    $schema: 'http://json-schema.org/draft-07/schema#',
    definitions: {
        HexString: {
            type: 'string',
        },
        MetadataUrl: {
            additionalProperties: false,
            properties: {
                hash: {
                    $ref: '#/definitions/HexString',
                },
                url: {
                    type: 'string',
                },
            },
            required: ['url'],
            type: 'object',
        },
        VerifiableCredentialMetadata: {
            additionalProperties: false,
            properties: {
                backgroundColor: {
                    type: 'string',
                },
                image: {
                    $ref: '#/definitions/MetadataUrl',
                },
                localization: {
                    additionalProperties: {
                        $ref: '#/definitions/MetadataUrl',
                    },
                    type: 'object',
                },
                logo: {
                    $ref: '#/definitions/MetadataUrl',
                },
                title: {
                    type: 'string',
                },
            },
            required: ['title', 'logo', 'backgroundColor'],
            type: 'object',
        },
    },
};

export interface VerifiableCredentialMetadata {
    title: string;
    logo: MetadataUrl;
    backgroundColor: string;
    image?: MetadataUrl;
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
        method: `${getContractName(instanceInfo)}.credentialEntry`,
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

/**
 * Retrieves data from the from the specified URL. The result is validated according
 * to the supplied JSON schema.
 */
async function fetchDataFromUrl<T>(
    { url, hash }: MetadataUrl,
    abortController: AbortController,
    jsonSchema: typeof verifiableCredentialMetadataSchema | typeof verifiableCredentialSchemaSchema
): Promise<T> {
    const response = await fetch(url, {
        headers: new Headers({ 'Access-Control-Allow-Origin': '*' }),
        mode: 'cors',
        signal: abortController.signal,
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch the schema at: ${url}`);
    }

    const body = Buffer.from(await response.arrayBuffer());
    if (hash && sha256([body]).toString('hex') !== hash) {
        throw new Error(`The content at URL ${url} did not match the provided checksum: ${hash}`);
    }

    let bodyAsObject;
    let bodyAsString;
    try {
        bodyAsString = body.toString();
        bodyAsObject = JSON.parse(bodyAsString);
    } catch (e) {
        throw new Error(`Failed to parse JSON: ${bodyAsString}`);
    }

    const validator = new jsonschema.Validator();
    const validationResult = validator.validate(bodyAsObject, jsonSchema);
    if (!validationResult.valid) {
        throw new Error(
            `The received JSON [${bodyAsString}] did not validate according to the schema: ${validationResult.errors}`
        );
    }

    return bodyAsObject as T;
}

/**
 * Retrieves a credential schema from the specified URL.
 */
export async function fetchCredentialSchema(
    url: MetadataUrl,
    abortController: AbortController
): Promise<VerifiableCredentialSchema> {
    return fetchDataFromUrl(url, abortController, verifiableCredentialSchemaSchema);
}

/**
 * Retrieves credential metadata from the specified URL.
 */
export async function fetchCredentialMetadata(
    metadata: MetadataUrl,
    abortController: AbortController
): Promise<VerifiableCredentialMetadata> {
    return fetchDataFromUrl(metadata, abortController, verifiableCredentialMetadataSchema);
}

/**
 * Retrieves credential schemas for each of the provided credentials. The method ensures
 * that duplicate schemas are not fetched multiple times, by only fetching once per
 * contract.
 * @param credentials the verifiable credentials to get schemas for
 * @param client the GRPC client for accessing a node
 * @param abortControllers controllers to enable aborting the fetching if needed
 * @returns a list of verifiable credential schemas
 */
export async function getCredentialSchemas(
    credentials: VerifiableCredential[],
    abortControllers: AbortController[],
    client: ConcordiumGRPCClient
) {
    const onChainSchemas: VerifiableCredentialSchema[] = [];

    const allContractAddresses = credentials.map((vc) => getCredentialRegistryContractAddress(vc.id));
    const issuerContractAddresses = new Set(allContractAddresses);

    for (const contractAddress of issuerContractAddresses) {
        let registryMetadata: MetadataResponse | undefined;
        try {
            registryMetadata = await getCredentialRegistryMetadata(client, contractAddress);
        } catch (e) {
            throw new Error(`Failed to get registry metadata for contract: ${contractAddress.index} with error: ${e}`);
        }

        if (registryMetadata) {
            const controller = new AbortController();
            abortControllers.push(controller);
            try {
                const credentialSchema = await fetchCredentialSchema(
                    registryMetadata.credentialSchema.schema,
                    controller
                );
                onChainSchemas.push(credentialSchema);
            } catch (e) {
                // Ignore errors that occur because we aborted, as that is expected to happen.
                if (!controller.signal.aborted) {
                    // TODO This should be logged.
                }
            }
        }
    }

    return onChainSchemas;
}

/**
 * Retrieves credential metadata for each of the provided credentials. The method ensures
 * that duplicate metadata (metadata hosted at the same URL) is not fetched multiple
 * times.
 * @param client the GRPC client for accessing a node
 * @param credentials the verifiable credentials to get metadata for
 * @param abortControllers controllers to enable aborting the fetching if needed
 * @returns a list of pairs of verifiable credential metadata and the URL they were fetched from (their key)
 */
export async function getCredentialMetadata(
    credentials: VerifiableCredential[],
    client: ConcordiumGRPCClient,
    abortControllers: AbortController[]
) {
    const metadataUrls: MetadataUrl[] = [];
    for (const vc of credentials) {
        const entry = await getVerifiableCredentialEntry(
            client,
            getCredentialRegistryContractAddress(vc.id),
            getCredentialHolderId(vc.id)
        );
        if (entry) {
            metadataUrls.push(entry.credentialInfo.metadataUrl);
        }
    }

    // We filter any duplicate URLs. Note that there could be metadata pairs (url, hash) with the
    // same URL but separate hashes that are thrown away here. This is done intentionally for now,
    // as the assumption is that that would be a rare situation. This means that the first instance
    // of the URL is the one used for gathering the credential metadata.
    const uniqueMetadataUrls = [...new Map(metadataUrls.map((item) => [item.url, item])).values()];

    const metadataList: { metadata: VerifiableCredentialMetadata; url: string }[] = [];
    for (const metadataUrl of uniqueMetadataUrls) {
        const controller = new AbortController();
        abortControllers.push(controller);
        try {
            const metadata = await fetchCredentialMetadata(metadataUrl, controller);
            metadataList.push({ metadata, url: metadataUrl.url });
        } catch (e) {
            // Ignore errors that occur because we aborted, as that is expected to happen.
            if (!controller.signal.aborted) {
                // TODO This should be logged.
            }
        }
    }

    return metadataList;
}

export async function getChangesToCredentialMetadata(
    credentials: VerifiableCredential[],
    client: ConcordiumGRPCClient,
    abortControllers: AbortController[],
    storedMetadata: Record<string, VerifiableCredentialMetadata>
) {
    const upToDateCredentialMetadata = await getCredentialMetadata(credentials, client, abortControllers);
    let updatedStoredMetadata = { ...storedMetadata };
    let updateReceived = false;

    for (const updatedMetadata of upToDateCredentialMetadata) {
        if (storedMetadata.value === undefined) {
            updatedStoredMetadata = {
                [updatedMetadata.url]: updatedMetadata.metadata,
            };
            updateReceived = true;
        } else {
            updatedStoredMetadata[updatedMetadata.url] = updatedMetadata.metadata;
            if (JSON.stringify(storedMetadata[updatedMetadata.url]) !== JSON.stringify(updatedMetadata.metadata)) {
                updateReceived = true;
            }
        }
    }

    return { data: updatedStoredMetadata, updateReceived };
}

export async function getChangesToCredentialSchemas(
    credentials: VerifiableCredential[],
    client: ConcordiumGRPCClient,
    abortControllers: AbortController[],
    storedSchemas: Record<string, VerifiableCredentialSchema>
) {
    const upToDateSchemas = await getCredentialSchemas(credentials, abortControllers, client);
    let updatedSchemasInStorage = { ...storedSchemas };
    let updateReceived = false;

    for (const updatedSchema of upToDateSchemas) {
        if (storedSchemas === undefined) {
            updatedSchemasInStorage = {
                [updatedSchema.$id]: updatedSchema,
            };
            updateReceived = true;
        } else {
            updatedSchemasInStorage[updatedSchema.$id] = updatedSchema;
            if (JSON.stringify(storedSchemas[updatedSchema.$id]) !== JSON.stringify(updatedSchema)) {
                updateReceived = true;
            }
        }
    }
    return { data: updatedSchemasInStorage, updateReceived };
}

/**
 * Get the registry issuer public key from a credential registry CIS-4 contract.
 * @param client the GRPC client for accessing a node
 * @param contractAddress the address of a CIS-4 contract
 * @returns the registry public key for the contract
 */
export async function getCredentialRegistryIssuerKey(
    client: ConcordiumGRPCClient,
    contractAddress: ContractAddress
): Promise<string> {
    const instanceInfo = await client.getInstanceInfo(contractAddress);
    if (instanceInfo === undefined) {
        throw new Error('Given contract address was not a created instance');
    }

    const result = await client.invokeContract({
        contract: contractAddress,
        method: `${getContractName(instanceInfo)}.issuer`,
    });

    if (result.tag !== 'success') {
        throw new Error(result.reason.tag);
    }

    const { returnValue } = result;
    if (returnValue === undefined) {
        throw new Error(`Return value is missing from issuer public key result in CIS-4 contract: ${contractAddress}`);
    }

    return returnValue;
}

/**
 * Create a publicKey DID identitifer for the given key.
 */
export function createPublicKeyIdentifier(publicKey: string, network: NetworkConfiguration): string {
    return `did:ccd:${getNet(network).toLowerCase()}:pkc:${publicKey}`;
}

/**
 * Create a DID identitifer for the given web3Id credential.
 */
export function createCredentialId(
    credentialHolderId: string,
    issuer: ContractAddress,
    network: NetworkConfiguration
): string {
    return `did:ccd:${getNet(network).toLowerCase()}:sci:${issuer.index}:${
        issuer.subindex
    }/credentialEntry/${credentialHolderId}`;
}

/**
 * Extracts the network from any concordium DID identitifer.
 * Note that if the network is not present in the DID, then 'mainnet' is returned, per the specifiction, see https://proposals.concordium.software/ID/concordium-did.html#identifier-syntax.
 * @param did the did to extract network from. did:ccd:NETWORK:...
 * @returns the name of the network
 */
export function getDIDNetwork(did: string): 'mainnet' | 'testnet' {
    const didParts = did.split(':');
    const network = didParts[2];
    if (network !== 'testnet' && network !== 'mainnet') {
        // Only testnet and mainnet are valid identifiers, and if neither are present, then the network identifier is not present, and it defaults to mainnet.
        return 'mainnet';
    }
    return network;
}
