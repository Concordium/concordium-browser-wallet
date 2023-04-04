import { Buffer } from 'buffer/';
import { Transport } from './Transport';
import pathAsBuffer from './Path';
import { serializeVerifyKey } from '../utils/serializationHelpers';
import { PublicInformationForIp } from '../utils/types';

const INS_PUBLIC_INFO_FOR_IP = 0x20;

export default async function signPublicInformationForIp(
    transport: Transport,
    path: number[],
    publicInfoForIp: PublicInformationForIp
): Promise<Buffer> {
    const idCredPubBytes = Buffer.from(publicInfoForIp.idCredPub, 'hex');
    const regId = Buffer.from(publicInfoForIp.regId, 'hex');
    const verificationKeysListLength = Object.entries(publicInfoForIp.publicKeys.keys).length;
    const data = Buffer.concat([
        pathAsBuffer(path),
        idCredPubBytes,
        regId,
        Buffer.from(Uint8Array.of(verificationKeysListLength)),
    ]);
    let p1 = 0x00;
    const p2 = 0x00;

    await transport.send(0xe0, INS_PUBLIC_INFO_FOR_IP, p1, p2, data);

    const keyIndices = Object.keys(publicInfoForIp.publicKeys.keys)
        .map((idx) => parseInt(idx, 10))
        .sort();

    p1 = 0x01;
    for (let i = 0; i < verificationKeysListLength; i += 1) {
        const index = keyIndices[i];
        const verificationKey = publicInfoForIp.publicKeys.keys[index];

        const keyData = Buffer.concat([Buffer.from(Uint8Array.of(index)), serializeVerifyKey(verificationKey)]);

        // eslint-disable-next-line  no-await-in-loop
        await transport.send(0xe0, INS_PUBLIC_INFO_FOR_IP, p1, p2, keyData);
    }

    p1 = 0x02;
    const response = await transport.send(
        0xe0,
        INS_PUBLIC_INFO_FOR_IP,
        p1,
        p2,
        Buffer.from(Buffer.of(publicInfoForIp.publicKeys.threshold))
    );

    const signature = response.slice(0, 64);
    return signature;
}
