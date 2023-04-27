import { Network } from '@concordium/common-sdk';
import { Buffer } from 'buffer/';
import { INS_VERIFY_ADDRESS } from './constants';
import { Transport } from './Transport';

export default async function verifyAddress(
    transport: Transport,
    net: Network,
    identityProvider: number,
    identity: number,
    credentialNumber: number
): Promise<void> {
    const p1 = 0x00;
    let p2;
    if (net === 'Mainnet') {
        p2 = 1;
    } else {
        p2 = 2;
    }
    const data = Buffer.alloc(12);
    data.writeUInt32BE(identityProvider, 0);
    data.writeUInt32BE(identity, 4);
    data.writeUInt32BE(credentialNumber, 8);

    await transport.send(0xe0, INS_VERIFY_ADDRESS, p1, p2, data);
}
