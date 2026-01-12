/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Helper module for Ledger device connection using WebHID
 */
import { Buffer } from 'buffer';
import Transport from '@ledgerhq/hw-transport';
import TransportWebHID from '@ledgerhq/hw-transport-webhid';
import { storedLedgerConnection } from '@shared/storage/access';
import { LedgerConnectionState } from '@shared/storage/types';

let activeTransport: Transport | null = null;
let activeDeviceName: string | null = null;

window.Buffer = Buffer;
export interface LedgerDeviceInfo {
    transport: Transport;
    deviceName: string;
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
    const existingState = await storedLedgerConnection.get();
    const state: LedgerConnectionState = {
        isConnected: true,
        deviceName,
        lastConnectedAt: Date.now(),
        autoConnect: existingState?.autoConnect ?? false,
        ...details,
    };
    await storedLedgerConnection.set(state);
}

/**
 * Loads the saved Ledger connection state from storage
 */
export async function loadLedgerConnectionState(): Promise<LedgerConnectionState | undefined> {
    return storedLedgerConnection.get();
}

/**
 * Clears the saved Ledger connection state from storage
 */
export async function clearLedgerConnectionState(): Promise<void> {
    await storedLedgerConnection.remove();
}

export async function connectLedgerDevice(): Promise<LedgerDeviceInfo> {
    if (activeTransport) {
        return {
            transport: activeTransport,
            deviceName: activeDeviceName ?? 'Ledger Device',
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

    const ledgerTransport = transport as any;
    if (typeof ledgerTransport.on === 'function') {
        ledgerTransport.on('disconnect', () => {
            activeTransport = null;
            activeDeviceName = null;
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
        await clearLedgerConnectionState();
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
