import { decrypt, encrypt } from '@popup/shared/crypto';

test('decrypt can decrypt encrypted data', () => {
    const data = 'Data to encrypt';
    const password = '123456';

    const encryptedData = encrypt(data, password);
    const decryptedData = decrypt(encryptedData, password);

    expect(decryptedData).toEqual(data);
});

export {};
