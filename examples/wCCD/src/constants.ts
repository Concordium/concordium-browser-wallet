// The TESTNET_GENESIS_BLOCK_HASH is used to check that the user has its browser wallet connected to testnet and not to mainnet.
import { Network } from './wallet/WalletConnection';

export const TESTNET_GENESIS_BLOCK_HASH = '4221332d34e1694168c2a0c0b3fd0f273809612cb13d000d5c2e00e85f50f796';

export const CONTRACT_NAME_PROXY = 'CIS2-wCCD-Proxy';
export const CONTRACT_NAME_IMPLEMENTATION = 'CIS2-wCCD';
export const CONTRACT_NAME_STATE = 'CIS2-wCCD-State';

/** If you want to test admin functions of the wCCD contract,
 * it will be necessary to instantiate your own wCCD contract using an account available in the browser wallet,
 * and change these constants to match the indexes of the instances.
 *
 * Should match the subindexes of the instances targeted.
 * V1 Module reference on testnet: 2975c0dded52f5f78118c42970785da9227e2bc8173af0b913599df8e3023818
 */
export const WCCD_PROXY_INDEX = 866n;
export const WCCD_IMPLEMENTATION_INDEX = 865n;
export const WCCD_STATE_INDEX = 864n;

export const CONTRACT_SUB_INDEX = 0n;

export const TESTNET = new Network('testnet', TESTNET_GENESIS_BLOCK_HASH, 'https://json-rpc.testnet.concordium.com');
