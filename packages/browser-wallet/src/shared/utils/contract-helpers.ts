/**
 * Applies a buffer of 20% to an estimated execution energy amount. The goal is to prevent transactions
 * from running into insufficient energy errors.
 * @param estimatedExecutionEnergy the estimated execution cost for an update transaction, should be retrieved by invoking the contract
 * @returns returns the estimated execution energy with an additional buffer added to prevent running into insufficient energy errors
 */
export function applyExecutionNRGBuffer(estimatedExecutionEnergy: bigint) {
    return (estimatedExecutionEnergy * 12n) / 10n;
}
