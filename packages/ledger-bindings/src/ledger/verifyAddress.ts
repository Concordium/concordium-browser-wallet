import { Buffer } from 'buffer/';
import { Transport } from './Transport';

const INS_VERIFY_ADDRESS = 0x00;

export default async function verifyAddress(
    transport: Transport,
    identity: number,
    credentialNumber: number
): Promise<void> {
    const data = Buffer.alloc(8);
    data.writeUInt32BE(identity, 0);
    data.writeUInt32BE(credentialNumber, 4);
    const p1 = 0x00;
    const p2 = 0x00;

    await transport.send(0xe0, INS_VERIFY_ADDRESS, p1, p2, data);
}
