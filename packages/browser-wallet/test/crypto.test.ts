import { decrypt, encrypt } from '@popup/shared/crypto';
import { EncryptedData } from '@shared/storage/types';

test('decrypt can decrypt data encrypted by Concordium utils', () => {
    // This example was encrypted using the 'utils' binary from Concordium base.
    const utilsEncryptedExample: EncryptedData = {
        cipherText: '1b07q4AZdXoTh3pPwT29/cbCq4mdvZNO9LyoCBs5YG3WOpPZ9XoRE/uRGRFjv604HiS3+YppBxKjQKKP85Q57A==',
        metadata: {
            encryptionMethod: 'AES-256',
            keyDerivationMethod: 'PBKDF2WithHmacSHA256',
            iterations: 100000,
            salt: 'qGLyP5Ol+uss5rUDGfpLgw==',
            initializationVector: '8OAT0V7XX5ftoS6eTlSQ2g==',
            keyLen: 32,
            hashAlgorithm: 'sha256',
        },
    };

    const decryptedData = decrypt(utilsEncryptedExample, '123456');
    expect(decryptedData).toEqual('This is a text message that should be encrypted.\n');
});

test('encrypted data does not contain raw input data', () => {
    const data = 'Data to encrypt';
    const encryptedData = encrypt(data, '123456');

    expect(JSON.stringify(encryptedData)).not.toContain(data);
});

test('decrypt can decrypt encrypted data', () => {
    const data = 'Data to encrypt';
    const password = '123456';

    const encryptedData = encrypt(data, password);
    const decryptedData = decrypt(encryptedData, password);

    expect(decryptedData).toEqual(data);
});

export {};
