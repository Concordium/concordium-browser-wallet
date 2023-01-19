// The TESTNET_GENESIS_BLOCK_HASH is used to check that the user has its browser wallet connected to testnet and not to mainnet.
import { Network } from '@concordium/react-components';

export const TESTNET_GENESIS_BLOCK_HASH = '4221332d34e1694168c2a0c0b3fd0f273809612cb13d000d5c2e00e85f50f796';

export const E_SEALING_CONTRACT_NAME = 'eSealing';

export const E_SEALING_CONTRACT_INDEX = 2481n;

export const E_SEALING_RAW_SCHEMA =
    '//8DAQAAAAgAAABlU2VhbGluZwACAAAABwAAAGdldEZpbGUGHiAAAAAVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAUAAIAAAAJAAAAdGltZXN0YW1wDQcAAAB3aXRuZXNzCxUFAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCCwAAAE9ubHlBY2NvdW50AhEAAABBbHJlYWR5UmVnaXN0ZXJlZAIMAAAAcmVnaXN0ZXJGaWxlBB4gAAAAFQUAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAILAAAAT25seUFjY291bnQCEQAAAEFscmVhZHlSZWdpc3RlcmVkAgEVAQAAAAwAAABSZWdpc3RyYXRpb24BAQAAABQAAwAAAAkAAABmaWxlX2hhc2geIAAAAAcAAAB3aXRuZXNzCwkAAAB0aW1lc3RhbXAN';

export const CONTRACT_SUB_INDEX = 0n;

export const WALLET_CONNECT_PROJECT_ID = '76324905a70fe5c388bab46d3e0564dc';
export const TESTNET: Network = {
    name: 'testnet',
    genesisHash: TESTNET_GENESIS_BLOCK_HASH,
    jsonRpcUrl: 'https://json-rpc.testnet.concordium.com',
    ccdScanBaseUrl: 'https://testnet.ccdscan.io',
};
