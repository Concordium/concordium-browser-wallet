export default class ClosedWhileSendingError extends Error {
    type = 'ClosedWhileSending';
}

export function instanceOfClosedWhileSendingError(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    object: any
): object is ClosedWhileSendingError {
    return object.type && object.type === 'ClosedWhileSending';
}
