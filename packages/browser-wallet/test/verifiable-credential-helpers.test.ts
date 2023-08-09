import {
    getCredentialHolderId,
    getCredentialRegistryContractAddress,
} from '../src/shared/utils/verifiable-credential-helpers';

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
