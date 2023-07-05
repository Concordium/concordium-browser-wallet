import {
    CredentialEntry,
    RevocationDataHolder,
    RevokeCredentialHolderParam,
    SigningData,
    deserializeCredentialEntry,
    getCredentialHolderId,
    getCredentialRegistryContractAddress,
    serializeRevokeCredentialHolderParam,
} from '../src/shared/utils/verifiable-credential-helpers';

test('serializing a revoke credential holder parameter', () => {
    const signingData: SigningData = {
        contractAddress: { index: 4718n, subindex: 0n },
        entryPoint: 'revokeCredentialHolder',
        nonce: 0n,
        timestamp: 1688542350309n,
    };

    const data: RevocationDataHolder = {
        credentialId: '2eec102b173118dda466411fc7df88093788a34c3e2a4b0a8891f5c671a9d106',
        signingData,
    };

    const revokeCredentialHolderParam: RevokeCredentialHolderParam = {
        signature:
            'a70b2b7987a2835726bc6166da1e4d223b9f215962e20726a39ea95afaf9d10d13d0f093761f2f2a4c34d37f081ea501fed8ab74fb565b87822ff0aec6071309',
        data,
    };

    expect(serializeRevokeCredentialHolderParam(revokeCredentialHolderParam).toString('hex')).toEqual(
        'a70b2b7987a2835726bc6166da1e4d223b9f215962e20726a39ea95afaf9d10d13d0f093761f2f2a4c34d37f081ea501fed8ab74fb565b87822ff0aec60713092eec102b173118dda466411fc7df88093788a34c3e2a4b0a8891f5c671a9d1066e12000000000000000000000000000016007265766f6b6543726564656e7469616c486f6c6465720000000000000000e58bf7248901000000'
    );
});

test('deserializing a credential entry', () => {
    const serializedCredentialEntry =
        '2eec102b173118dda466411fc7df88093788a34c3e2a4b0a8891f5c671a9d10601300099cc213d3bda6677df0663ec8ec54a2c05ccae0e8b99ba6130f6931ee85c3de04f4d42f0e4bb3f541e5592ade117b0fe26f5c17688010000000c4d7943726564656e7469616c0300666f6f001100687474703a2f2f736368656d612e6f7267000000000000000000';

    const expected: CredentialEntry = {
        credentialHolderId: '2eec102b173118dda466411fc7df88093788a34c3e2a4b0a8891f5c671a9d106',
        credentialType: 'MyCredential',
        holderRevocable: true,
        metadataChecksum: undefined,
        metadataUrl: 'foo',
        revocationNonce: 0n,
        schemaChecksum: undefined,
        schemaUrl: 'http://schema.org',
        validFrom: 1685619602726n,
        validUntil: undefined,
    };

    expect(deserializeCredentialEntry(serializedCredentialEntry)).toEqual(expected);
});

test('credential holder id is extracted from verifiable credential id field', () => {
    const id =
        'did:ccd:mainnet:sci:4718:0/credentialEntry/2eec102b173118dda466411fc7df88093788a34c3e2a4b0a8891f5c671a9d106';
    expect(getCredentialHolderId(id)).toEqual('2eec102b173118dda466411fc7df88093788a34c3e2a4b0a8891f5c671a9d106');
});

test('an error is thrown if credential holder id has invalid length', () => {
    const id =
        'did:ccd:mainnet:sci:4718:0/credentialEntry/2eec102b173118dda466411fc7df88093788a34c3e4b0a8891f5c671a9d106';
    expect(() => getCredentialHolderId(id)).toThrow(Error);
});

test('credentialHolderId: an error is thrown if the credential id is invalid', () => {
    const id =
        'did:ccd:mainnet:sci:4718:0credentialEntry2eec102b173118dda466411fc7df88093788a34c3e4b0a8891f5c671a9d106';
    expect(() => getCredentialHolderId(id)).toThrow(Error);
});

test('registry contract address is extracted from verifiable credential id field', () => {
    const id =
        'did:ccd:mainnet:sci:4718:0/credentialEntry/2eec102b173118dda466411fc7df88093788a34c3e2a4b0a8891f5c671a9d106';
    expect(getCredentialRegistryContractAddress(id)).toEqual({ index: BigInt(4718), subindex: BigInt(0) });
});

test('credentialRegistryContractAddress: an error is thrown if the credential id is invalid', () => {
    const id =
        'did:ccd:mainnet:sci:4718:0credentialEntry2eec102b173118dda466411fc7df88093788a34c3e4b0a8891f5c671a9d106';
    expect(() => getCredentialRegistryContractAddress(id)).toThrow(Error);
});
