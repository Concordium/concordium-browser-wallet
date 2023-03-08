// The TESTNET_GENESIS_BLOCK_HASH is used to check that the user has its browser wallet connected to testnet and not to mainnet.
import {
    BrowserWalletConnector,
    ephemeralConnectorType,
    Network,
    WalletConnectConnector,
} from '@concordium/react-components';
import { SignClientTypes } from '@walletconnect/types';

export const TESTNET_GENESIS_BLOCK_HASH = '4221332d34e1694168c2a0c0b3fd0f273809612cb13d000d5c2e00e85f50f796';

export const SPONSORED_TX_CONTRACT_NAME = 'eSealing';

export const SPONSORED_TX_CONTRACT_INDEX = 2481n;

export const SPONSORED_TX_RAW_SCHEMA =
    '//8DAQAAAAgAAABlU2VhbGluZwACAAAABwAAAGdldEZpbGUGHiAAAAAVAgAAAAQAAABOb25lAgQAAABTb21lAQEAAAAUAAIAAAAJAAAAdGltZXN0YW1wDQcAAAB3aXRuZXNzCxUFAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCCwAAAE9ubHlBY2NvdW50AhEAAABBbHJlYWR5UmVnaXN0ZXJlZAIMAAAAcmVnaXN0ZXJGaWxlBB4gAAAAFQUAAAALAAAAUGFyc2VQYXJhbXMCBwAAAExvZ0Z1bGwCDAAAAExvZ01hbGZvcm1lZAILAAAAT25seUFjY291bnQCEQAAAEFscmVhZHlSZWdpc3RlcmVkAgEVAQAAAAwAAABSZWdpc3RyYXRpb24BAQAAABQAAwAAAAkAAABmaWxlX2hhc2geIAAAAAcAAAB3aXRuZXNzCwkAAAB0aW1lc3RhbXAN';

export const CONTRACT_SUB_INDEX = 0n;

const WALLET_CONNECT_PROJECT_ID = '76324905a70fe5c388bab46d3e0564dc';
const WALLET_CONNECT_OPTS: SignClientTypes.Options = {
    projectId: WALLET_CONNECT_PROJECT_ID,
    metadata: {
        name: 'sponsoredTxs',
        description: 'Example dApp for sponsored txs.',
        url: '#',
        icons: ['https://walletconnect.com/walletconnect-logo.png'],
    },
};
export const TESTNET: Network = {
    name: 'testnet',
    genesisHash: TESTNET_GENESIS_BLOCK_HASH,
    jsonRpcUrl: 'https://json-rpc.testnet.concordium.com',
    ccdScanBaseUrl: 'https://testnet.ccdscan.io',
};

export const BROWSER_WALLET = ephemeralConnectorType(BrowserWalletConnector.create);
export const WALLET_CONNECT = ephemeralConnectorType(
    WalletConnectConnector.create.bind(undefined, WALLET_CONNECT_OPTS)
);
