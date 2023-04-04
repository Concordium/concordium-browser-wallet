enum StatusCodes {
    // Locked code on 1.6.1 firmware
    DeviceLocked161 = 0x6804,
    UserRejection = 0x6985,
    InvalidState = 0x6b01,
    InvalidPath = 0x6b02,
    InvalidParam = 0x6b03,
    InvalidTransaction = 0x6b04,
    DeviceLocked = 0x6b0c,
    DeviceLocked161NoTranslation = 0x530c,
}

const lockedText = 'The device is locked. Please unlock the device before submitting again.';
const incompatibleText = 'The desktop application is incompatible with the Ledger application.';

const errorCodeMap = new Map<number, string>();
errorCodeMap.set(StatusCodes.UserRejection, 'The action was declined on the Ledger device.');
errorCodeMap.set(StatusCodes.InvalidState, `Invalid state. ${incompatibleText}`);
errorCodeMap.set(StatusCodes.InvalidPath, `Invalid path. ${incompatibleText}`);
errorCodeMap.set(StatusCodes.InvalidParam, `Invalid parameter. ${incompatibleText}`);
errorCodeMap.set(StatusCodes.InvalidTransaction, `Invalid transaction. ${incompatibleText}`);
errorCodeMap.set(StatusCodes.DeviceLocked, lockedText);
errorCodeMap.set(StatusCodes.DeviceLocked161, lockedText);
errorCodeMap.set(StatusCodes.DeviceLocked161NoTranslation, lockedText);

/**
 * Maps a non-successful status code from the Ledger device to a human readable error description.
 * @param statusCode status code returned by the Ledger
 */
export default function getErrorDescription(statusCode: number): string {
    const errorDescription = errorCodeMap.get(statusCode);
    if (errorDescription) {
        return errorDescription;
    }
    return 'An unknown error occurred while communicating with your Ledger device.';
}
