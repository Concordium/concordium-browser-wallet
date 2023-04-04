export default class TransportStatusError extends Error {
    name = 'TransportStatusError';

    message = '';

    statusCode: number;

    stack = '';

    statusText = '';

    constructor(statusCode: number) {
        super();
        this.statusCode = statusCode;
    }
}

export function instanceOfTransportStatusError(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    object: any
): object is TransportStatusError {
    return 'name' in object && object.name === 'TransportStatusError' && 'message' in object && 'statusCode' in object;
}
