import {
    getCredentialIdFromSubjectDID,
    getContractAddressFromIssuerDID,
    getVerifiableCredentialPublicKeyfromSubjectDID,
} from '../src/popup/pages/Web3ProofRequest/utils';

test('getContractAddressFromIssuerDID', () => {
    const address = getContractAddressFromIssuerDID('did:ccd:testnet:sci:1337:42/issuer');
    expect(address.index).toBe(1337n);
    expect(address.subindex).toBe(42n);
});

test('getVerifiableCredentialPublicKeyfromSubjectDID', () => {
    const publicKey = getVerifiableCredentialPublicKeyfromSubjectDID(
        'did:ccd:testnet:sci:1337:42/credentialEntry/76ada0ebd1e8aa5a651a0c4ac1ad3b62d3040f693722f94d61efa4fdd6ee797d'
    );
    expect(publicKey).toBe('76ada0ebd1e8aa5a651a0c4ac1ad3b62d3040f693722f94d61efa4fdd6ee797d');
});

test('getVerifiableCredentialPublicKeyfromSubjectDID', () => {
    const credId = getCredentialIdFromSubjectDID(
        'did:ccd:testnet:cred:aad98095db73b5b22f7f64823a495c6c57413947353646313dc453fa4604715d2f93b2c1f8cb4c9625edd6330e1d27fa'
    );
    expect(credId).toBe(
        'aad98095db73b5b22f7f64823a495c6c57413947353646313dc453fa4604715d2f93b2c1f8cb4c9625edd6330e1d27fa'
    );
});
