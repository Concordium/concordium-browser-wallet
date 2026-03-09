import { RpcError } from '@protobuf-ts/runtime-rpc';

export function displayUrl(url: string) {
    const { hostname } = new URL(url);

    if (hostname.length < 29) {
        return hostname;
    }

    return `${hostname.substring(0, 29)}...`;
}

export function safeParseRpcErrorMessage(error: RpcError | { message: string }): string {
    if (error instanceof RpcError) {
        try {
            const decodedError = decodeURIComponent(error.message);
            return `RpcError: ${decodedError}`;
        } catch {
            return `RpcError: ${error.message}`;
        }
    } else {
        return error.message;
    }
}
