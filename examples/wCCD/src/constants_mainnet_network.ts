// The MAINNEt_GENESIS_BLOCK_HASH is used to check that the user has its browser wallet connected to testnet and not to mainnet.
import { Network } from '@concordium/react-components';

export const MAINET_GENESIS_BLOCK_HASH = '9dd9ca4d19e9393877d2c44b70f89acbfc0883c2243e5eeaecc0d1cd0503f478';

export const NETWORK: Network = {
    name: 'mainnet',
    genesisHash: MAINET_GENESIS_BLOCK_HASH,
    jsonRpcUrl: 'https://json-rpc.mainnet.concordium.software',
    ccdScanBaseUrl: 'https://ccdscan.io',
};

/** If you want to test admin functions of the wCCD contract,
 * it will be necessary to instantiate your own wCCD contract using an account available in the browser wallet,
 * and change these constants to match the indexes of the instances.
 *
 * Should match the subindexes of the instances targeted.
 * V1 Module reference on testnet: cc285180b45d7695db75c29dee004d2e81a1383880c9b122399bea809196c98f
 */
export const WCCD_CONTRACT_INDEX = 9354n;
