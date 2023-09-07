import { ContractAddress, InstanceInfo } from '@concordium/web-sdk';

/**
 * Applies a buffer of 20% to an estimated execution energy amount. The goal is to prevent transactions
 * from running into insufficient energy errors.
 * @param estimatedExecutionEnergy the estimated execution cost for an update transaction, should be retrieved by invoking the contract
 * @returns returns the estimated execution energy with an additional buffer added to prevent running into insufficient energy errors
 */
export function applyExecutionNRGBuffer(estimatedExecutionEnergy: bigint) {
    return (estimatedExecutionEnergy * 12n) / 10n;
}

/**
 * Get the name of a contract.
 * This works as the name in an instance info is prefixed with 'init_'.
 * @param instanceInfo the instance info to extract the contract name from
 * @returns the contract's name to be used as a prefix when setting the receive name for a contract method
 */
export function getContractName(instanceInfo: InstanceInfo): string | undefined {
    return instanceInfo.name.substring(5);
}

/**
 * Determine whether two contract addresses are the same
 */
export function areContractAddressesEqual(a: ContractAddress, b: ContractAddress) {
    return a.index === b.index && a.subindex === b.subindex;
}
