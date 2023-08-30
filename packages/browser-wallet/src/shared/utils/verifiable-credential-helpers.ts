import { CcdAmount, UpdateContractPayload, ConcordiumGRPCClient, ContractAddress, sha256 } from '@concordium/web-sdk';
import * as ed from '@noble/ed25519';
import {
    MetadataUrl,
    NetworkConfiguration,
    VerifiableCredential,
    VerifiableCredentialSchema,
    VerifiableCredentialStatus,
} from '@shared/storage/types';
import { Buffer } from 'buffer/';
import jsonschema from 'jsonschema';
import { applyExecutionNRGBuffer, getContractName } from './contract-helpers';
import { getNet } from './network-helpers';
import { logError } from './log-helpers';

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
    const fiveMinutesInMilliseconds = 5 * 60000;
    const signatureExpirationTimestamp = BigInt(Date.now() + fiveMinutesInMilliseconds);
    const signingData: SigningData = {
        contractAddress: address,
        entryPoint: 'revokeCredentialHolder',
        nonce,
        timestamp: signatureExpirationTimestamp,
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

    return applyExecutionNRGBuffer(invokeResult.usedEnergy);
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
        throw new Error('Given contract address was not a created instance');
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
        throw new Error('Given contract address was not a created instance');
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
                            additionalProperties: false,
                            properties: {
                                attributes: {
                                    additionalProperties: false,
                                    properties: {
                                        description: {
                                            type: 'string',
                                        },
                                        properties: {
                                            additionalProperties: {
                                                anyOf: [
                                                    {
                                                        additionalProperties: false,
                                                        properties: {
                                                            description: {
                                                                type: 'string',
                                                            },
                                                            format: {
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
                                                    {
                                                        $ref: '#/definitions/TimestampProperty',
                                                    },
                                                ],
                                            },
                                            type: 'object',
                                        },
                                        required: {
                                            items: {
                                                type: 'string',
                                            },
                                            type: 'array',
                                        },
                                        title: {
                                            type: 'string',
                                        },
                                        type: {
                                            const: 'object',
                                            type: 'string',
                                        },
                                    },
                                    required: ['type', 'properties', 'required'],
                                    type: 'object',
                                },
                                id: {
                                    additionalProperties: false,
                                    properties: {
                                        description: {
                                            type: 'string',
                                        },
                                        format: {
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
                            required: ['id', 'attributes'],
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
                    required: ['type', 'properties', 'required'],
                    type: 'object',
                },
            },
            required: ['credentialSubject'],
            type: 'object',
        },
        TimestampProperty: {
            additionalProperties: false,
            properties: {
                description: {
                    type: 'string',
                },
                properties: {
                    additionalProperties: false,
                    properties: {
                        timestamp: {
                            additionalProperties: false,
                            properties: {
                                format: {
                                    const: 'date-time',
                                    type: 'string',
                                },
                                type: {
                                    const: 'string',
                                    type: 'string',
                                },
                            },
                            required: ['type'],
                            type: 'object',
                        },
                        type: {
                            additionalProperties: false,
                            properties: {
                                const: {
                                    const: 'date-time',
                                    type: 'string',
                                },
                                type: {
                                    const: 'string',
                                    type: 'string',
                                },
                            },
                            required: ['type', 'const'],
                            type: 'object',
                        },
                    },
                    required: ['type', 'timestamp'],
                    type: 'object',
                },
                required: {
                    items: [
                        {
                            const: 'type',
                            type: 'string',
                        },
                        {
                            const: 'timestamp',
                            type: 'string',
                        },
                    ],
                    maxItems: 2,
                    minItems: 2,
                    type: 'array',
                },
                title: {
                    type: 'string',
                },
                type: {
                    const: 'object',
                    type: 'string',
                },
            },
            required: ['title', 'type', 'properties', 'required'],
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

const localizationRecordSchema = {
    $ref: '#/definitions/Localization',
    $schema: 'http://json-schema.org/draft-07/schema#',
    definitions: {
        Localization: {
            additionalProperties: {
                type: 'string',
            },
            type: 'object',
        },
    },
};

const issuerMetadataSchema = {
    $ref: '#/definitions/IssuerMetadata',
    $schema: 'http://json-schema.org/draft-07/schema#',
    definitions: {
        HexString: {
            type: 'string',
        },
        IssuerMetadata: {
            additionalProperties: false,
            properties: {
                description: {
                    type: 'string',
                },
                icon: {
                    $ref: '#/definitions/MetadataUrl',
                },
                name: {
                    type: 'string',
                },
                url: {
                    type: 'string',
                },
            },
            type: 'object',
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
    jsonSchema:
        | typeof verifiableCredentialMetadataSchema
        | typeof verifiableCredentialSchemaSchema
        | typeof localizationRecordSchema
        | typeof issuerMetadataSchema
): Promise<T> {
    const response = await fetch(url, {
        headers: new Headers({ 'Access-Control-Allow-Origin': '*' }),
        mode: 'cors',
        signal: abortController.signal,
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch the data at: ${url}`);
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

export async function fetchLocalization(
    url: MetadataUrl,
    abortController: AbortController
): Promise<Record<string, string>> {
    return fetchDataFromUrl(url, abortController, localizationRecordSchema);
}

export interface IssuerMetadata {
    name?: string;
    icon?: MetadataUrl;
    description?: string;
    url?: string;
}

/**
 * Retrieves registry issuer metadata from the specified URL.
 */
export async function fetchIssuerMetadata(
    metadata: MetadataUrl,
    abortController: AbortController
): Promise<IssuerMetadata> {
    return fetchDataFromUrl(metadata, abortController, issuerMetadataSchema);
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
                    logError(e);
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
        try {
            const entry = await getVerifiableCredentialEntry(
                client,
                getCredentialRegistryContractAddress(vc.id),
                getCredentialHolderId(vc.id)
            );
            if (entry) {
                metadataUrls.push(entry.credentialInfo.metadataUrl);
            }
        } catch (e) {
            logError(e);
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
                logError(e);
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
        if (Object.keys(updatedStoredMetadata).length === 0) {
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
        if (Object.keys(updatedSchemasInStorage).length === 0) {
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

/** Takes a Web3IdCredential issuer DID string and returns the contract address
 * @param did a issuer DID string on the form: "did:ccd:NETWORK:sci:INDEX:SUBINDEX/issuer"
 * @returns the contract address INDEX;SUBINDEX
 */
export function getContractAddressFromIssuerDID(did: string): ContractAddress {
    const preSplit = did.split('/');
    if (preSplit[1] !== 'issuer') {
        throw new Error('Given DID did not follow expected format');
    }
    const split = preSplit[0].split(':');
    if ((split.length !== 6 && split.length !== 5) || split[split.length - 3] !== 'sci') {
        throw new Error('Given DID did not follow expected format');
    }
    const index = BigInt(split[split.length - 2]);
    const subindex = BigInt(split[split.length - 1]);
    return { index, subindex };
}

/** Takes a Web3IdCredential subject DID string and returns the publicKey of the verifiable credential
 * @param did a DID string on the form: "did:ccd:NETWORK:sci:INDEX:SUBINDEX/credentialEntry/KEY"
 * @returns the public key KEY
 */
export function getVerifiableCredentialPublicKeyfromSubjectDID(did: string) {
    const split = did.split('/');
    if (split.length !== 3 || split[0].split(':')[split[0].split(':').length - 3] !== 'sci') {
        throw new Error(`Given DID did not follow expected format:${did}`);
    }
    return split[2];
}

/** Takes a AccountCredential subject DID string and returns the credential id of the account credential
 * @param did a DID string on the form: "did:ccd:NETWORK:cred:CREDID"
 * @returns the credId CREDID
 */
export function getCredentialIdFromSubjectDID(did: string) {
    const split = did.split(':');
    if ((split.length !== 5 && split.length !== 4) || split[split.length - 2] !== 'cred') {
        throw new Error(`Given DID did not follow expected format: ${did}`);
    }
    return split[split.length - 1];
}
