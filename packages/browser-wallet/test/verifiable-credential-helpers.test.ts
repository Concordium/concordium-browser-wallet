import { Schema, Validator } from 'jsonschema';
import { ContractAddress } from '@concordium/web-sdk';
import {
    RevocationDataHolder,
    RevokeCredentialHolderParam,
    SigningData,
    getCredentialHolderId,
    getCredentialRegistryContractAddress,
    serializeRevokeCredentialHolderParam,
    createCredentialId,
    createPublicKeyIdentifier,
    getPublicKeyfromPublicKeyIdentifierDID,
    CredentialQueryResponse,
    deserializeCredentialEntry,
    getCredentialIdFromSubjectDID,
    getContractAddressFromIssuerDID,
    getVerifiableCredentialPublicKeyfromSubjectDID,
    coerceBigIntIntegerToNumber,
} from '../src/shared/utils/verifiable-credential-helpers';
import { mainnet, testnet } from '../src/shared/constants/networkConfiguration';
//
test('serializing a revoke credential holder parameter', () => {
    const signingData: SigningData = {
        contractAddress: ContractAddress.create(4718n, 0n),
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
        '22ea01dfab98d77c686358528faade31b88d2866633a31a2d6dd4119cf7a58c401f9ad46f889010000004e0068747470733a2f2f676973742e67697468756275736572636f6e74656e742e636f6d2f6f72686f6a2f32326162376364316161373464633834663766663734643534303136346463342f7261772f001500687474703a2f2f636f6e636f726469756d2e636f6d000100000000000000';

    const expected: CredentialQueryResponse = {
        credentialInfo: {
            credentialHolderId: '22ea01dfab98d77c686358528faade31b88d2866633a31a2d6dd4119cf7a58c4',
            holderRevocable: true,
            metadataUrl: {
                url: 'https://gist.githubusercontent.com/orhoj/22ab7cd1aa74dc84f7ff74d540164dc4/raw/',
            },
            validFrom: 1692087528953n,
            validUntil: undefined,
        },
        schemaRef: {
            schema: {
                url: 'http://concordium.com',
            },
        },
        revocationNonce: 1n,
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
    expect(getCredentialRegistryContractAddress(id)).toEqual(ContractAddress.create(4718, 0));
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
        ContractAddress.create(4n, 3n),
        testnet
    );
    expect(didTestnet).toEqual(
        'did:ccd:testnet:sci:4:3/credentialEntry/aa379617282c124e5c341573295e92f6fcb67cd8c852afb8c61943daba694b6d'
    );
    const didMainnet = createCredentialId(
        '4799ec95500850d9368ca012faf60e9d632d3b1768d608c7e5e3d53fe96d669a',
        ContractAddress.create(2n, 7n),
        mainnet
    );
    expect(didMainnet).toEqual(
        'did:ccd:mainnet:sci:2:7/credentialEntry/4799ec95500850d9368ca012faf60e9d632d3b1768d608c7e5e3d53fe96d669a'
    );
});

test('getContractAddressFromIssuerDID extracts contract address', () => {
    const address = getContractAddressFromIssuerDID('did:ccd:testnet:sci:1337:42/issuer');
    expect(address.index).toBe(1337n);
    expect(address.subindex).toBe(42n);
});

test('getContractAddressFromIssuerDID extracts contract address without network', () => {
    const address = getContractAddressFromIssuerDID('did:ccd:sci:1338:43/issuer');
    expect(address.index).toBe(1338n);
    expect(address.subindex).toBe(43n);
});

test('getVerifiableCredentialPublicKeyfromSubjectDID extracts public key', () => {
    const publicKey = getVerifiableCredentialPublicKeyfromSubjectDID(
        'did:ccd:testnet:sci:1337:42/credentialEntry/76ada0ebd1e8aa5a651a0c4ac1ad3b62d3040f693722f94d61efa4fdd6ee797d'
    );
    expect(publicKey).toBe('76ada0ebd1e8aa5a651a0c4ac1ad3b62d3040f693722f94d61efa4fdd6ee797d');
});

test('getVerifiableCredentialPublicKeyfromSubjectDID extracts public key without network', () => {
    const publicKey = getVerifiableCredentialPublicKeyfromSubjectDID(
        'did:ccd:sci:1337:42/credentialEntry/76ada0ebd1e8aa5a651a0c4ac1ad3b62d3040f693722f94d61efa4fdd6ee797d'
    );
    expect(publicKey).toBe('76ada0ebd1e8aa5a651a0c4ac1ad3b62d3040f693722f94d61efa4fdd6ee797d');
});

test('getCredentialIdFromSubjectDID extracts credId', () => {
    const credId = getCredentialIdFromSubjectDID(
        'did:ccd:testnet:cred:aad98095db73b5b22f7f64823a495c6c57413947353646313dc453fa4604715d2f93b2c1f8cb4c9625edd6330e1d27fa'
    );
    expect(credId).toBe(
        'aad98095db73b5b22f7f64823a495c6c57413947353646313dc453fa4604715d2f93b2c1f8cb4c9625edd6330e1d27fa'
    );
});

test('getCredentialIdFromSubjectDID extracts credId without network', () => {
    const credId = getCredentialIdFromSubjectDID(
        'did:ccd:cred:aad98095db73b5b22f7f64823a495c6c57413947353646313dc453fa4604715d2f93b2c1f8cb4c9625edd6330e1d27fa'
    );
    expect(credId).toBe(
        'aad98095db73b5b22f7f64823a495c6c57413947353646313dc453fa4604715d2f93b2c1f8cb4c9625edd6330e1d27fa'
    );
});

test('bigint with type integer validates against schema when coercing in pre validate', () => {
    const validator = new Validator();
    const schema: Schema = {
        type: 'object',
        properties: {
            age: { type: 'integer' },
        },
    };

    const p = {
        age: BigInt(97),
    };

    const validationResult = validator.validate(p, schema, { preValidateProperty: coerceBigIntIntegerToNumber });

    expect(validationResult.valid).toBeTruthy();
});
