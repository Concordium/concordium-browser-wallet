/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Helper module for Ledger device connection using WebHID and @blooo/hw-app-concordium
 */
import { Buffer } from 'buffer';
import Transport from '@ledgerhq/hw-transport';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import Concordium from '@blooo/hw-app-concordium';
import { storedLedgerConnection } from '@shared/storage/access';
import { LedgerConnectionState, LedgerAccountMetadata } from '@shared/storage/types';

let activeTransport: Transport | null = null;
let activeDeviceName: string | null = null;
let activeConcordiumApp: Concordium | null = null;

window.Buffer = Buffer;

// Extend Navigator interface to include WebHID API
declare global {
    interface Navigator {
        hid: HID;
    }
}

export interface LedgerDeviceInfo {
    transport: Transport;
    deviceName: string;
    concordiumApp: Concordium;
}

/**
 * Gets or creates the Concordium app instance for the active transport
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function getConcordiumApp(transport: Transport): Concordium {
    if (!activeConcordiumApp) {
        activeConcordiumApp = new Concordium(transport);
    }
    return activeConcordiumApp;
}

/**
 * Builds a BIP44 derivation path for Concordium Ledger accounts
 * Format: 44/919/identityProvider/identityIndex/credentialIndex/keyIndex
 * @param identityProvider - Identity provider index
 * @param identityIndex - Identity index
 * @param credentialIndex - Credential index (account number)
 * @param keyIndex - Key index (typically 0)
 * @returns BIP44 path string
 */
export function buildLedgerPath(
    identityProvider: number,
    identityIndex: number,
    credentialIndex: number,
    keyIndex: number = 0
): string {
    return `44/919/${identityProvider}/${identityIndex}/${credentialIndex}/${keyIndex}`;
}

/**
 * Parses a Ledger derivation path into its components
 * @param path - BIP44 path string (e.g., "44/919/0/0/0/0")
 * @returns Parsed path components
 */
export function parseLedgerPath(path: string): {
    identityProvider: number;
    identityIndex: number;
    credentialIndex: number;
    keyIndex: number;
} {
    const parts = path.split('/').map(Number);
    if (parts.length !== 6 || parts[0] !== 44 || parts[1] !== 919) {
        throw new Error(`Invalid Concordium Ledger path: ${path}`);
    }
    return {
        identityProvider: parts[2],
        identityIndex: parts[3],
        credentialIndex: parts[4],
        keyIndex: parts[5],
    };
}

/**
 * Connects to a Ledger device using WebHID
 * @returns Promise that resolves with transport and device information
 * @throws Error if connection fails or user cancels
 */
/**
 * Saves the current Ledger connection state to persistent storage
 */
export async function saveLedgerConnectionState(
    deviceName: string,
    details?: {
        productId?: number;
        vendorId?: number;
        serialNumber?: string;
        deviceModel?: string;
    }
): Promise<void> {
    try {
        const existingState = await storedLedgerConnection.get();
        const state: LedgerConnectionState = {
            isConnected: true,
            deviceName,
            lastConnectedAt: Date.now(),
            autoConnect: existingState?.autoConnect ?? false,
            ...details,
        };
        await storedLedgerConnection.set(state);
    } catch (error) {
        console.error('Error saving Ledger connection state:', error);
        // Don't throw - allow the connection to proceed even if storage fails
    }
}

/**
 * Loads the saved Ledger connection state from storage
 */
export async function loadLedgerConnectionState(): Promise<LedgerConnectionState | undefined> {
    try {
        return await storedLedgerConnection.get();
    } catch (error) {
        console.error('Error loading Ledger connection state:', error);
        return undefined;
    }
}

/**
 * Clears the saved Ledger connection state from storage
 */
export async function clearLedgerConnectionState(): Promise<void> {
    try {
        await storedLedgerConnection.remove();
    } catch (error) {
        console.error('Error clearing Ledger connection state:', error);
        // Don't throw - allow cleanup to proceed
    }
}

export async function connectLedgerDevice(): Promise<LedgerDeviceInfo> {
    if (activeTransport && activeConcordiumApp) {
        return {
            transport: activeTransport,
            deviceName: activeDeviceName ?? 'Ledger Device',
            concordiumApp: activeConcordiumApp,
        };
    }

    const transport = await TransportWebHID.create();

    // Extract device information from the transport's device property
    const { device } = transport as any;
    const deviceName = device?.productName || 'Ledger Device';
    const productId = device?.productId;
    const vendorId = device?.vendorId;
    const serialNumber = device?.serialNumber || undefined;

    // Determine device model from product name
    let deviceModel = 'Unknown';
    if (deviceName.includes('Nano S Plus')) {
        deviceModel = 'Nano S Plus';
    } else if (deviceName.includes('Nano X')) {
        deviceModel = 'Nano X';
    } else if (deviceName.includes('Nano S')) {
        deviceModel = 'Nano S';
    }

    activeTransport = transport;
    activeDeviceName = deviceName;
    activeConcordiumApp = new Concordium(transport);

    const ledgerTransport = transport as any;
    if (typeof ledgerTransport.on === 'function') {
        ledgerTransport.on('disconnect', () => {
            activeTransport = null;
            activeDeviceName = null;
            activeConcordiumApp = null;
            clearLedgerConnectionState().catch(console.error);
        });
    }

    // Save connection state with device details to storage
    await saveLedgerConnectionState(deviceName, {
        productId,
        vendorId,
        serialNumber,
        deviceModel,
    });

    return {
        transport,
        deviceName,
        concordiumApp: activeConcordiumApp,
    };
}

/**
 * Disconnects from the current Ledger device
 */
export async function disconnectLedgerDevice(): Promise<void> {
    if (!activeTransport) {
        return;
    }

    try {
        await activeTransport.close();
    } finally {
        activeTransport = null;
        activeDeviceName = null;
        activeConcordiumApp = null;
        await clearLedgerConnectionState();
    }
}

/**
 * Gets public key from Ledger for a specific derivation path
 * Uses @blooo/hw-app-concordium to communicate with the Concordium app on Ledger
 * @param concordiumApp - The Concordium app instance
 * @param derivationPath - BIP44 path format: "44/919/identityProvider/identityIndex/credentialIndex/keyIndex"
 * @returns Public key and verify key
 */
export async function getLedgerAccountInfo(
    concordiumApp: Concordium,
    derivationPath: string = '44/919/0/0/0/0'
): Promise<{ publicKey: string; verifyKey: string; address?: string; credId?: string }> {
    // Get public key from Ledger device
    const result = await concordiumApp.getPublicKey(derivationPath);

    return {
        publicKey: result.publicKey.toString(),
        verifyKey: result.publicKey.toString(), // The verify key is the public key
        // Note: address and credId would need to be computed or fetched from chain
        // For now, we return undefined - they should be set when account is deployed
    };
}
/**
 * Signs a transaction using Ledger device
 * @param concordiumApp - The Concordium app instance
 * @param derivationPath - BIP44 path (e.g., "44/919/0/0/0/0")
 * @param transactionBuffer - The transaction to sign
 */
export async function signTransactionWithLedger(): Promise<{ signature: Buffer; publicKey: Buffer }> {
    // Note: Check @blooo/hw-app-concordium documentation for the correct signing method
    // Common methods are: signTransactionHash, signCCD, etc.
    throw new Error(
        'Transaction signing method not yet implemented. Check @blooo/hw-app-concordium API documentation.'
    );
}

/**
 * Signs a credential deployment using Ledger device
 * @param concordiumApp - The Concordium app instance
 * @param derivationPath - BIP44 path (e.g., "44/919/0/0/0/0")
 * @param credentialBuffer - The credential deployment to sign
 */
export async function signCredentialWithLedger(
    concordiumApp: Concordium,
    derivationPath: string,
    credentialBuffer: Buffer
): Promise<{ signature: Buffer; publicKey: Buffer }> {
    const result = await concordiumApp.signCredential(derivationPath, credentialBuffer);
    return {
        signature: result.signature,
        publicKey: result.publicKey,
    };
}

/**
 * Gets information about the currently connected Ledger device without establishing transport
 * Useful for checking device presence without triggering connection UI
 */
export async function getConnectedLedgerInfo(): Promise<{ deviceName: string; productId: number } | null> {
    try {
        if (!navigator.hid) {
            return null;
        }

        const devices = await navigator.hid.getDevices();
        const LEDGER_VENDOR_ID = 0x2c97;

        const ledgerDevice = devices.find((device) => device.vendorId === LEDGER_VENDOR_ID);

        if (!ledgerDevice) {
            return null;
        }

        return {
            deviceName: ledgerDevice.productName || 'Ledger Device',
            productId: ledgerDevice.productId,
        };
    } catch (error) {
        console.error('Error getting Ledger device info:', error);
        return null;
    }
}

/**
 * Discovers multiple accounts from a Ledger device
 * @param concordiumApp - The Concordium app instance
 * @param identityProvider - Identity provider index
 * @param identityIndex - Identity index
 * @param startCredentialIndex - Starting credential (account) index
 * @param count - Number of accounts to discover
 * @param keyIndex - Key index (typically 0)
 */
export async function discoverLedgerAccounts(
    concordiumApp: Concordium,
    identityProvider: number,
    identityIndex: number,
    startCredentialIndex: number = 0,
    count: number = 5,
    keyIndex: number = 0
): Promise<LedgerAccountMetadata[]> {
    const accounts: LedgerAccountMetadata[] = [];
    const deviceInfo = await getConnectedLedgerInfo();

    // eslint-disable-next-line no-plusplus
    for (let i = startCredentialIndex; i < startCredentialIndex + count; i++) {
        const path = buildLedgerPath(identityProvider, identityIndex, i, keyIndex);
        const accountInfo = await getLedgerAccountInfo(concordiumApp, path);

        accounts.push({
            deviceId: deviceInfo?.productId.toString() || 'unknown',
            deviceName: deviceInfo?.deviceName || 'Ledger Device',
            derivationPath: path,
            publicKey: accountInfo.publicKey,
            verifyKey: accountInfo.verifyKey,
            credId: '', // Will be set during credential deployment with identity
            address: '', // Will be derived from credId after credential deployment
            identityProvider,
            identityIndex,
            credentialIndex: i,
            keyIndex,
        });
    }

    return accounts;
}

/**
 * Verifies that the Concordium app is open on the Ledger device
 */
export async function verifyLedgerAppOpen(concordiumApp: Concordium): Promise<boolean> {
    try {
        // Try to get public key from a standard path to verify the app is open
        // This is a lightweight operation that will fail if the app is not open
        await concordiumApp.getPublicKey('44/919/0/0/0/0');
        return true;
    } catch (error) {
        console.error('Concordium app not open on Ledger:', error);
        return false;
    }
}

/**
 * Checks if a Ledger device is currently connected by querying WebHID API
 * This verifies actual physical device presence, not just stored state
 * @returns Promise that resolves to true if a Ledger device is connected and accessible
 */
export async function isLedgerConnected(): Promise<boolean> {
    try {
        // Check if WebHID is available
        if (!navigator.hid) {
            return false;
        }

        // Get list of previously paired/authorized HID devices
        const devices = await navigator.hid.getDevices();

        // Ledger vendor ID is 0x2c97
        const LEDGER_VENDOR_ID = 0x2c97;

        // Check if any device is a Ledger device
        const ledgerDevice = devices.find((device) => device.vendorId === LEDGER_VENDOR_ID);

        return ledgerDevice !== undefined;
    } catch (error) {
        console.error('Error checking Ledger connection:', error);
        return false;
    }
}
