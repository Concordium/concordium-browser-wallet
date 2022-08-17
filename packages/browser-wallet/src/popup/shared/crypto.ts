import { EncryptedData } from '@shared/storage/types';
import CryptoJS from 'crypto-js/';

const keyLen = 32;
const iterations = 10000;
const method = 'AES-256';
const hashAlgorithm = 'sha256';
const keyDerivationMethod = 'PBKDF2WithHmacSHA256';

function encrypt(data: string, password: string): EncryptedData {
    const salt = CryptoJS.lib.WordArray.random(16);
    const key = CryptoJS.PBKDF2(CryptoJS.enc.Utf8.parse(password), salt, {
        iterations,
        hasher: CryptoJS.algo.SHA256,
        keySize: 256 / 32,
    });
    const iv = CryptoJS.lib.WordArray.random(16);

    const encryptedValue = CryptoJS.AES.encrypt(CryptoJS.enc.Utf8.parse(data), key, {
        iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
    });

    return {
        cipherText: encryptedValue.toString(),
        metadata: {
            keyLen,
            iterations,
            encryptionMethod: method,
            salt: salt.toString(CryptoJS.enc.Base64),
            initializationVector: iv.toString(CryptoJS.enc.Base64),
            hashAlgorithm,
            keyDerivationMethod,
        },
    };
}

export { encrypt };
