import { InstanceInfo } from '@concordium/web-sdk';

/**
 * Get the name of a contract.
 * This works as the name in an instance info is prefixed with 'init_'.
 * @param instanceInfo the instance info to extract the contract name from
 * @returns the contract's name to be used as a prefix when setting the receive name for a contract method
 */
export function getContractName(instanceInfo: InstanceInfo): string | undefined {
    return instanceInfo.name.substring(5);
}
