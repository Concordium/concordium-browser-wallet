// The TESTNET_GENESIS_BLOCK_HASH is used to check that the user has its browser wallet connected to testnet and not to mainnet.
import { Network } from '@concordium/react-components';

export const TESTNET_GENESIS_BLOCK_HASH = '4221332d34e1694168c2a0c0b3fd0f273809612cb13d000d5c2e00e85f50f796';

export const NETWORK: Network = {
    name: 'testnet',
    genesisHash: TESTNET_GENESIS_BLOCK_HASH,
    jsonRpcUrl: 'https://json-rpc.testnet.concordium.com',
    ccdScanBaseUrl: 'https://testnet.ccdscan.io',
};

/** If you want to test admin functions of the wCCD contract,
 * it will be necessary to instantiate your own wCCD contract using an account available in the browser wallet,
 * and change these constants to match the indexes of the instances.
 *
 * Should match the subindexes of the instances targeted.
 * V1 Module reference on testnet: cc285180b45d7695db75c29dee004d2e81a1383880c9b122399bea809196c98f
 */
export const WCCD_CONTRACT_INDEX = 2059n;
