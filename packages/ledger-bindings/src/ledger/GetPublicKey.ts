import { Buffer } from 'buffer/';
import { Transport } from './Transport';
import { SignedPublicKey } from '../utils/types';
import pathAsBuffer from './Path';

const INS_PUBLIC_KEY = 0x01;

export async function getPublicKey(transport: Transport, path: number[]): Promise<Buffer> {
    const data = pathAsBuffer(path);

    const p1 = 0x00;
    const p2 = 0x00;

    const response = await transport.send(0xe0, INS_PUBLIC_KEY, p1, p2, data);
    return response.slice(0, 32);
}

export async function getPublicKeySilent(transport: Transport, path: number[]): Promise<Buffer> {
    const data = pathAsBuffer(path);

    const p1 = 0x01;
    const p2 = 0x00;

    const response = await transport.send(0xe0, INS_PUBLIC_KEY, p1, p2, data);
    return response.slice(0, 32);
}

export async function getSignedPublicKey(transport: Transport, path: number[]): Promise<SignedPublicKey> {
    const data = pathAsBuffer(path);

    const p1 = 0x00;
    const p2 = 0x01;

    const response = await transport.send(0xe0, INS_PUBLIC_KEY, p1, p2, data);
    return {
        key: response.slice(0, 32).toString('hex'),
        signature: response.slice(32, 96).toString('hex'),
    };
}
