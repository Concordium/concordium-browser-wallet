export const SIMPLE_TRANSFER_ENERGY_TOTAL_COST = 501n;

// TODO: replace this with helpers from SDK
export function determineUpdatePayloadSize(parameterSize: number, receiveName: string) {
    return 8n + 8n + 8n + 2n + BigInt(parameterSize) + 2n + BigInt(receiveName.length);
}

// TODO: replace this with helpers from SDK
export function determineInitPayloadSize(parameterSize: number, contractName: string) {
    return 8n + 64n + 2n + BigInt(parameterSize) + 2n + BigInt(contractName.length + 5);
}
