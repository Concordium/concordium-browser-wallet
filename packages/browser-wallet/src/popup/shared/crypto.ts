import { EncryptedData } from '@shared/storage/types';
import { Buffer } from 'buffer';

const keyLen = 32;
const iterations = 10000;
const method = 'AES-256-GCM';
const subtleCryptoMethodName = 'AES-GCM';
const hashAlgorithm = 'sha256';
const keyDerivationMethod = 'PBKDF2WithHmacSHA256';

async function deriveKey(password: string, salt: Buffer): Promise<CryptoKey> {
    const passwordBuffer = Buffer.from(password, 'utf-8');

    const baseKey = await global.crypto.subtle.importKey('raw', passwordBuffer, { name: 'PBKDF2' }, false, [
        'deriveKey',
    ]);

    const derivedKey = await global.crypto.subtle.deriveKey(
        {
            name: 'PBKDF2',
            salt,
            iterations,
            hash: 'SHA-256',
        },
        baseKey,
        { name: subtleCryptoMethodName, length: keyLen * 8 },
        false,
        ['encrypt', 'decrypt']
    );

    return derivedKey;
}

export async function encrypt(data: string, password: string): Promise<EncryptedData> {
    const salt = Buffer.from(global.crypto.getRandomValues(new Uint8Array(16)));
    const key = await deriveKey(password, salt);

    const iv = global.crypto.getRandomValues(new Uint8Array(16));
    const encrypted = await global.crypto.subtle.encrypt(
        { name: subtleCryptoMethodName, iv },
        key,
        Buffer.from(data, 'utf-8')
    );

    return {
        cipherText: Buffer.from(encrypted).toString('base64'),
        metadata: {
            keyLen,
            iterations,
            encryptionMethod: method,
            salt: salt.toString('base64'),
            initializationVector: Buffer.from(iv).toString('base64'),
            hashAlgorithm,
            keyDerivationMethod,
        },
    };
}

export async function decrypt(data: EncryptedData, password: string): Promise<string> {
    const salt = Buffer.from(data.metadata.salt, 'base64');
    const iv = Buffer.from(data.metadata.initializationVector, 'base64');
    const key = await deriveKey(password, salt);

    try {
        const decrypted = await crypto.subtle.decrypt(
            { name: subtleCryptoMethodName, iv },
            key,
            Buffer.from(data.cipherText, 'base64')
        );
        return Buffer.from(decrypted).toString('utf-8');
    } catch (e) {
        throw new Error('The password was incorrect');
    }
}
