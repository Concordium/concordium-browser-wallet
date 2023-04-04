export default class TransportError extends Error {
    name = 'TransportError';

    message = '';

    id = '';
}

export function instanceOfTransportError(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    object: any
): object is TransportError {
    return 'name' in object && object.name === 'TransportError' && 'message' in object && 'id' in object;
}

export function isInvalidChannelError(error: TransportError): boolean {
    return error.id === 'InvalidChannel';
}
