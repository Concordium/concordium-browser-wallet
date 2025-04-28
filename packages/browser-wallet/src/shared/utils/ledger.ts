export interface LedgerDeviceDetails {
    productName?: string;
    opened?: boolean;
    transportType?: string;
    vendorId?: string;
    productId?: string;
    serialNumber?: string;
    deviceId: string;
}

export type LedgerMessage =
    | { type: 'REQUEST_LEDGER_DEVICE' }
    | { type: 'DISCONNECT_LEDGER_DEVICE' }
    | { type: 'GET_LEDGER_STATUS' }
    | { type: 'LEDGER_CONNECTED'; success: true; details: LedgerDeviceDetails }
    | { type: 'LEDGER_ERROR'; success: false; error: string };
