/* eslint-disable no-console */
/* eslint-disable import/no-extraneous-dependencies */
import { Buffer } from 'buffer';
import Transport from '@ledgerhq/hw-transport';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import Concordium from '@blooo/hw-app-concordium';

window.Buffer = Buffer;

// buffer.js 519 code triggered by utils.ts 199

let ledgerTransport: Transport | null = null;

export async function getPublicKey(identity: number, index: number): Promise<string> {
    try {
        if (!ledgerTransport || !(ledgerTransport as unknown as TransportWebHID).device?.opened) {
            if (ledgerTransport) {
                try {
                    await ledgerTransport.close();
                } catch (e) {
                    // Ignore errors on close
                }
            }
            ledgerTransport = await TransportWebHID.create();
        }
        const ccd = new Concordium(ledgerTransport);
        const pathString = `44/919/${identity}/0/${index}/0`;

        const data = {
            identity,
            identityProvider: index,
        };

        const { privateKey, credentialId } = await ccd.exportPrivateKeyLegacy(data, 2, 2);

        // credentialId = idCredSec
        // privateKey = prfKey

        // console.log('Private Key (prfKey):', privateKey);
        // console.log('Credential ID (idCredSec):', credentialId);

        const response = await ccd.getPublicKey(pathString, true, false);
        // console.log('Public Key:', response.publicKey);

        if (response && response.publicKey) {
            localStorage.setItem('prfKey', privateKey ?? '');
            localStorage.setItem('idCredSec', credentialId ?? '');
            localStorage.setItem('publicKey', response.publicKey ?? '');
            localStorage.setItem('index', identity.toString());
            localStorage.setItem('providerIndex', index.toString());
            return response.publicKey;
        }

        // If no public key is found, throw an error
        throw new Error('Failed to retrieve public key from Ledger device');
    } catch (error: unknown) {
        // Handle specific Ledger errors
        if (error.name === 'LockedDeviceError') {
            throw new Error('Please unlock your Ledger device and open the Concordium app.');
        }

        // Handle transport errors
        if (error.message.includes('TransportError')) {
            ledgerTransport = null; // Reset the transport to force a reconnect on the next call
            throw new Error('Ledger device connection error. Please reconnect your device.');
        }

        throw new Error('An unexpected error occurred while fetching the public key.');
    }
}

export async function createCredentials(identity: number, index: number): Promise<string> {
    console.log('Creating credentials for identity:', identity, 'and index:', index);
    return '';
}
