import {
    createCredentialId,
    createPublicKeyIdentifier,
    getCredentialHolderId,
    getCredentialRegistryContractAddress,
    getPublicKeyfromPublicKeyIdentifierDID,
} from '../src/shared/utils/verifiable-credential-helpers';
import { mainnet, testnet } from '../src/shared/constants/networkConfiguration';

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

test('public key is extracted from pkc DID with network', () => {
    const did = 'did:ccd:testnet:pkc:aa379617282c124e5c341573295e92f6fcb67cd8c852afb8c61943daba694b6d';
    expect(getPublicKeyfromPublicKeyIdentifierDID(did)).toEqual(
        'aa379617282c124e5c341573295e92f6fcb67cd8c852afb8c61943daba694b6d'
    );
});

test('public key is extracted from pkc DID without network', () => {
    const did = 'did:ccd:pkc:aa379617282c124e5c341573295e92f6fcb67cd8c852afb8c61943daba694b6d';
    expect(getPublicKeyfromPublicKeyIdentifierDID(did)).toEqual(
        'aa379617282c124e5c341573295e92f6fcb67cd8c852afb8c61943daba694b6d'
    );
});

test('public key DID is created with correct network', () => {
    const didTestnet = createPublicKeyIdentifier(
        'aa379617282c124e5c341573295e92f6fcb67cd8c852afb8c61943daba694b6d',
        testnet
    );
    expect(didTestnet).toEqual('did:ccd:testnet:pkc:aa379617282c124e5c341573295e92f6fcb67cd8c852afb8c61943daba694b6d');
    const didMainnet = createPublicKeyIdentifier(
        'bf6bd029bddc7554a2c5c31869278b21496386c2c58339e1774f983560d666ce',
        mainnet
    );
    expect(didMainnet).toEqual('did:ccd:mainnet:pkc:bf6bd029bddc7554a2c5c31869278b21496386c2c58339e1774f983560d666ce');
});

test('credential Id is created with correct network', () => {
    const didTestnet = createCredentialId(
        'aa379617282c124e5c341573295e92f6fcb67cd8c852afb8c61943daba694b6d',
        { index: 4n, subindex: 3n },
        testnet
    );
    expect(didTestnet).toEqual(
        'did:ccd:testnet:sci:4:3/credentialEntry/aa379617282c124e5c341573295e92f6fcb67cd8c852afb8c61943daba694b6d'
    );
    const didMainnet = createCredentialId(
        '4799ec95500850d9368ca012faf60e9d632d3b1768d608c7e5e3d53fe96d669a',
        { index: 2n, subindex: 7n },
        mainnet
    );
    expect(didMainnet).toEqual(
        'did:ccd:mainnet:sci:2:7/credentialEntry/4799ec95500850d9368ca012faf60e9d632d3b1768d608c7e5e3d53fe96d669a'
    );
});
