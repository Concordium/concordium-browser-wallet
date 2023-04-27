import { Buffer } from 'buffer/';
import {
    AccountTransaction,
    AccountTransactionType,
    CredentialDeploymentInfo,
    UpdateCredentialsPayload,
} from '@concordium/common-sdk';
import { Transport } from './Transport';
import pathAsBuffer from './Path';
import { serializeTransactionHeader } from '../utils/transactionSerialization';
import { signCredentialValues, signCredentialProofs } from './CredentialDeployment';
import { INS_UPDATE_CREDENTIALS } from './constants';

export default async function signUpdateCredentials(
    transport: Transport,
    path: number[],
    transaction: AccountTransaction
): Promise<Buffer> {
    const pathPrefix = pathAsBuffer(path);
    const ins = INS_UPDATE_CREDENTIALS;

    const header = serializeTransactionHeader(transaction);

    const payload = transaction.payload as UpdateCredentialsPayload;

    const addedCredentials: [number, CredentialDeploymentInfo][] = payload.newCredentials.map(({ index, cdi }) => [
        index,
        cdi,
    ]);

    const addedCredentialsLength = addedCredentials.length;
    const removedCredentialsLength = payload.removeCredentialIds.length;

    const kindAndAddedLength = Buffer.alloc(2);
    kindAndAddedLength.writeUInt8(AccountTransactionType.UpdateCredentials, 0);
    kindAndAddedLength.writeUInt8(addedCredentialsLength, 1);

    let data = Buffer.concat([pathPrefix, header, kindAndAddedLength]);

    const p1 = 0x00;
    let p2 = 0x00;

    await transport.send(0xe0, ins, p1, p2, data);

    for (let i = 0; i < addedCredentialsLength; i += 1) {
        const [index, credentialInformation] = addedCredentials[i];
        data = Buffer.alloc(1);
        data.writeUInt8(index, 0);
        // eslint-disable-next-line  no-await-in-loop
        p2 = 0x01;
        // eslint-disable-next-line  no-await-in-loop
        await transport.send(0xe0, ins, p1, p2, data);
        p2 = 0x02;
        // eslint-disable-next-line  no-await-in-loop
        await signCredentialValues(transport, credentialInformation, ins, p2);
        // eslint-disable-next-line  no-await-in-loop
        await signCredentialProofs(transport, Buffer.from(credentialInformation.proofs, 'hex'), ins, p2);
    }

    p2 = 0x03;
    data = Buffer.alloc(1);
    data.writeUInt8(removedCredentialsLength, 0);

    await transport.send(0xe0, ins, p1, p2, data);

    p2 = 0x04;
    for (let i = 0; i < removedCredentialsLength; i += 1) {
        const removedCredId = payload.removeCredentialIds[i];
        data = Buffer.from(removedCredId, 'hex');

        // eslint-disable-next-line  no-await-in-loop
        await transport.send(0xe0, ins, p1, p2, data);
    }

    p2 = 0x05;
    data = Buffer.alloc(1);
    data.writeUInt8(payload.threshold, 0);

    const response = await transport.send(0xe0, ins, p1, p2, data);

    const signature = response.slice(0, 64);
    return signature;
}
