import { Transport } from './Transport';

export interface AppAndVersion {
    name: string;
    version: string;
}

/**
 * Retrieves information about the currently active application
 * on the Ledger device. See {@link https://github.com/LedgerHQ/ledgerjs/issues/122}
 * for information about the implementation details.
 * @param transport
 */
export default async function getAppAndVersion(transport: Transport): Promise<AppAndVersion> {
    const response = await transport.send(0xb0, 0x01, 0x00, 0x00);

    let i = 0;
    const format = response[i];
    i += 1;
    if (format !== 1) {
        throw new Error('getAppAndVersion: format not supported');
    }

    const nameLength = response[i];
    i += 1;
    const name = response.slice(i, (i += nameLength)).toString('ascii');

    const versionLength = response[i];
    i += 1;
    const version = response.slice(i, (i += versionLength)).toString('ascii');

    // We do not require the flags for anything, but they can be read by uncommenting the lines below.
    // const flagLength = response[i++];
    // const flags = response.slice(i, (i += flagLength));

    return { name, version };
}
