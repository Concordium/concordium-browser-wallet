import { Buffer } from 'buffer/';
import {
    UnsignedCredentialDeploymentInformation,
    IdOwnershipProofs,
    CredentialDeploymentValues,
    AttributesKeys,
    AttributeKeyString,
} from '@concordium/common-sdk';
import { Transport } from './Transport';
import { encodeWord64, putBase58Check, serializeVerifyKey, serializeYearMonth } from '../utils/serializationHelpers';
import pathAsBuffer from './Path';
import { INS_SIGN_CREDENTIAL_DEPLOYMENT } from './constants';

export async function signCredentialValues(
    transport: Transport,
    credentialDeployment: CredentialDeploymentValues,
    ins: number,
    p2: number
) {
    let p1 = 0x0a;

    const publicKeys = credentialDeployment.credentialPublicKeys;
    const verificationKeyListLength = Object.entries(publicKeys.keys).length;
    let data = Buffer.alloc(1);
    data.writeUInt8(verificationKeyListLength, 0);

    await transport.send(0xe0, ins, p1, p2, data);

    const keyIndices = Object.keys(publicKeys.keys)
        .map((idx) => parseInt(idx, 10))
        .sort();

    p1 = 0x01;
    for (let i = 0; i < verificationKeyListLength; i += 1) {
        const index = keyIndices[i];
        const verificationKey = publicKeys.keys[index];
        data = Buffer.concat([Buffer.from(Uint8Array.of(index)), serializeVerifyKey(verificationKey)]);

        // eslint-disable-next-line  no-await-in-loop
        await transport.send(0xe0, ins, p1, p2, data);
    }

    const signatureThreshold = Buffer.from(Uint8Array.of(publicKeys.threshold));
    const credId = Buffer.from(credentialDeployment.credId, 'hex');

    const identityProviderIdentity = Buffer.alloc(4);
    identityProviderIdentity.writeUInt32BE(credentialDeployment.ipIdentity, 0);

    const arThreshold = Buffer.from(Uint8Array.of(credentialDeployment.revocationThreshold));
    const arListLength = Object.entries(credentialDeployment.arData).length;
    const arListLengthAsBytes = Buffer.alloc(2);
    arListLengthAsBytes.writeUInt16BE(arListLength, 0);

    data = Buffer.concat([signatureThreshold, credId, identityProviderIdentity, arThreshold, arListLengthAsBytes]);
    p1 = 0x02;
    await transport.send(0xe0, ins, p1, p2, data);

    p1 = 0x03;

    const arIdentities = Object.keys(credentialDeployment.arData);
    for (let i = 0; i < arIdentities.length; i += 1) {
        const arIdentity = arIdentities[i];
        const encIdCredPub = Buffer.from(credentialDeployment.arData[arIdentity].encIdCredPubShare, 'hex');
        const arData = Buffer.alloc(4);
        arData.writeUInt32BE(parseInt(arIdentity, 10), 0);
        data = Buffer.concat([arData, encIdCredPub]);

        // eslint-disable-next-line  no-await-in-loop
        await transport.send(0xe0, ins, p1, p2, data);
    }

    p1 = 0x04;
    const validTo = serializeYearMonth(credentialDeployment.policy.validTo);
    const createdAt = serializeYearMonth(credentialDeployment.policy.createdAt);

    const revealedAttributeTags: [number, string][] = Object.entries(
        credentialDeployment.policy.revealedAttributes
    ).map(([tagName, value]) => [AttributesKeys[tagName as keyof typeof AttributeKeyString], value]);
    revealedAttributeTags.sort((a, b) => a[0] - b[0]);

    const attributeListLength = revealedAttributeTags.length;
    const attributeListLengthAsBytes = Buffer.alloc(2);
    attributeListLengthAsBytes.writeUInt16BE(attributeListLength, 0);

    data = Buffer.concat([validTo, createdAt, attributeListLengthAsBytes]);
    await transport.send(0xe0, ins, p1, p2, data);

    for (let i = 0; i < attributeListLength; i += 1) {
        const [attributeTag, attributeValue] = revealedAttributeTags[i];
        data = Buffer.alloc(2);
        data.writeUInt8(attributeTag, 0);
        const serializedAttributeValue = Buffer.from(attributeValue, 'utf-8');
        data.writeUInt8(serializedAttributeValue.length, 1);

        p1 = 0x05;
        // eslint-disable-next-line  no-await-in-loop
        await transport.send(0xe0, ins, p1, p2, data);

        p1 = 0x06;
        data = serializedAttributeValue;
        // eslint-disable-next-line  no-await-in-loop
        await transport.send(0xe0, ins, p1, p2, data);
    }
}

export async function signCredentialProofs(transport: Transport, proofs: Buffer, ins: number, p2: number) {
    const proofLength = Buffer.alloc(4);
    proofLength.writeUInt32BE(proofs.length, 0);
    let p1 = 0x07;
    await transport.send(0xe0, ins, p1, p2, proofLength);

    p1 = 0x08;

    let i = 0;
    while (i < proofs.length) {
        // eslint-disable-next-line  no-await-in-loop
        await transport.send(0xe0, ins, p1, p2, proofs.slice(i, Math.min(i + 255, proofs.length)));
        i += 255;
    }
}

function serializeIdOwnerShipProofs(proofs: IdOwnershipProofs) {
    const proofIdCredPub = Buffer.alloc(4);
    proofIdCredPub.writeUInt32BE(Object.entries(proofs.proofIdCredPub).length, 0);
    const idCredPubProofs = Buffer.concat(
        Object.entries(proofs.proofIdCredPub)
            .sort(([indexA], [indexB]) => parseInt(indexA, 10) - parseInt(indexB, 10))
            .map(([index, value]) => {
                const proof = Buffer.alloc(4 + 96);
                proof.writeUInt32BE(parseInt(index, 10), 0);
                proof.write(value, 4, 100, 'hex');
                return proof;
            })
    );

    return Buffer.concat([
        Buffer.from(proofs.sig, 'hex'),
        Buffer.from(proofs.commitments, 'hex'),
        Buffer.from(proofs.challenge, 'hex'),
        proofIdCredPub,
        idCredPubProofs,
        Buffer.from(proofs.proofIpSig, 'hex'),
        Buffer.from(proofs.proofRegId, 'hex'),
        Buffer.from(proofs.credCounterLessThanMaxAccounts, 'hex'),
    ]);
}

async function signCredentialDeployment(
    transport: Transport,
    credentialDeployment: UnsignedCredentialDeploymentInformation,
    newOrExisting: Buffer,
    path: number[]
): Promise<Buffer> {
    const pathPrefix = pathAsBuffer(path);

    const ins = INS_SIGN_CREDENTIAL_DEPLOYMENT;
    let p1 = 0x00;
    const p2 = 0x00;

    await transport.send(0xe0, ins, p1, p2, pathPrefix);

    await signCredentialValues(transport, credentialDeployment, ins, p2);

    const proofs = serializeIdOwnerShipProofs(credentialDeployment.proofs);

    await signCredentialProofs(transport, proofs, ins, p2);

    p1 = 0x09;
    const response = await transport.send(0xe0, ins, p1, p2, newOrExisting);

    const signature = response.slice(0, 64);
    return signature;
}

export async function signCredentialDeploymentOnNewAccount(
    transport: Transport,
    credentialDeployment: UnsignedCredentialDeploymentInformation,
    expiry: bigint,
    path: number[]
): Promise<Buffer> {
    let expiryBuffer = Buffer.alloc(1);
    expiryBuffer.writeUInt8(0, 0);
    const serializedExpiry = encodeWord64(expiry);
    expiryBuffer = Buffer.concat([expiryBuffer, serializedExpiry]);
    return signCredentialDeployment(transport, credentialDeployment, expiryBuffer, path);
}

export async function signCredentialDeploymentOnExistingAccount(
    transport: Transport,
    credentialDeployment: UnsignedCredentialDeploymentInformation,
    accountAddress: string,
    path: number[]
): Promise<Buffer> {
    const accountBuffer = Buffer.alloc(1 + 32);
    accountBuffer.writeUInt8(1, 0);
    putBase58Check(accountBuffer, 1, accountAddress);
    return signCredentialDeployment(transport, credentialDeployment, accountBuffer, path);
}
