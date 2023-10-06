// The TESTNET_GENESIS_BLOCK_HASH is used to check that the user has its browser wallet connected to testnet and not to mainnet.
import { BrowserWalletConnector, ephemeralConnectorType, WalletConnectConnector } from '@concordium/react-components';
import { SignClientTypes } from '@walletconnect/types';

export const CONTRACT_NAME = 'cis2_wCCD';

export const CONTRACT_SUB_INDEX = 0n;

export const WRAP_FUNCTION_RAW_SCHEMA =
    'FAACAAAAAgAAAHRvFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAECAAAADBYBBAAAAGRhdGEQAQI=';
export const UNWRAP_FUNCTION_RAW_SCHEMA =
    'FAAEAAAABgAAAGFtb3VudBslAAAABQAAAG93bmVyFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADAgAAAByZWNlaXZlchUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAgAAAAwWAQQAAABkYXRhEAEC';
export const VIEW_FUNCTION_RAW_SCHEMA =
    '//8CAQAAAAkAAABjaXMyX3dDQ0QBABQAAgAAAAMAAAB1cmwWAgQAAABoYXNoFQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAAEyAAAAACAQAAAAQAAAB2aWV3BRQAAwAAAAUAAABhZG1pbhUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwGAAAAcGF1c2VkAQwAAABtZXRhZGF0YV91cmwUAAIAAAADAAAAdXJsFgEEAAAAaGFzaBUCAAAABAAAAE5vbmUCBAAAAFNvbWUBAQAAABMgAAAAAhUEAAAADgAAAEludmFsaWRUb2tlbklkAhEAAABJbnN1ZmZpY2llbnRGdW5kcwIMAAAAVW5hdXRob3JpemVkAgYAAABDdXN0b20BAQAAABUJAAAACwAAAFBhcnNlUGFyYW1zAgcAAABMb2dGdWxsAgwAAABMb2dNYWxmb3JtZWQCDgAAAENvbnRyYWN0UGF1c2VkAhMAAABJbnZva2VDb250cmFjdEVycm9yAhMAAABJbnZva2VUcmFuc2ZlckVycm9yAhoAAABGYWlsZWRVcGdyYWRlTWlzc2luZ01vZHVsZQIcAAAARmFpbGVkVXBncmFkZU1pc3NpbmdDb250cmFjdAIlAAAARmFpbGVkVXBncmFkZVVuc3VwcG9ydGVkTW9kdWxlVmVyc2lvbgI=';
export const BALANCEOF_FUNCTION_RAW_SCHEMA =
    '//8CAQAAAAkAAABjaXMyX3dDQ0QBABQAAgAAAAMAAAB1cmwWAgQAAABoYXNoFQIAAAAEAAAATm9uZQIEAAAAU29tZQEBAAAAEyAAAAACAQAAAAkAAABiYWxhbmNlT2YGEAEUAAIAAAAIAAAAdG9rZW5faWQdAAcAAABhZGRyZXNzFQIAAAAHAAAAQWNjb3VudAEBAAAACwgAAABDb250cmFjdAEBAAAADBABGyUAAAAVBAAAAA4AAABJbnZhbGlkVG9rZW5JZAIRAAAASW5zdWZmaWNpZW50RnVuZHMCDAAAAFVuYXV0aG9yaXplZAIGAAAAQ3VzdG9tAQEAAAAVCQAAAAsAAABQYXJzZVBhcmFtcwIHAAAATG9nRnVsbAIMAAAATG9nTWFsZm9ybWVkAg4AAABDb250cmFjdFBhdXNlZAITAAAASW52b2tlQ29udHJhY3RFcnJvcgITAAAASW52b2tlVHJhbnNmZXJFcnJvcgIaAAAARmFpbGVkVXBncmFkZU1pc3NpbmdNb2R1bGUCHAAAAEZhaWxlZFVwZ3JhZGVNaXNzaW5nQ29udHJhY3QCJQAAAEZhaWxlZFVwZ3JhZGVVbnN1cHBvcnRlZE1vZHVsZVZlcnNpb24C';

const WALLET_CONNECT_PROJECT_ID = '76324905a70fe5c388bab46d3e0564dc';
const WALLET_CONNECT_OPTS: SignClientTypes.Options = {
    projectId: WALLET_CONNECT_PROJECT_ID,
    metadata: {
        name: 'wCCD',
        description: 'Example dApp for the wCCD token.',
        url: '#',
        icons: ['https://walletconnect.com/walletconnect-logo.png'],
    },
};

export const BROWSER_WALLET = ephemeralConnectorType(BrowserWalletConnector.create);
export const WALLET_CONNECT = ephemeralConnectorType(
    WalletConnectConnector.create.bind(undefined, WALLET_CONNECT_OPTS)
);

/** If you want to test admin functions of the wCCD contract,
 * it will be necessary to instantiate your own wCCD contract using an account available in the browser wallet,
 * and change these constants to match the indexes of the instances.
 *
 * Should match the subindexes of the instances targeted.
 * V1 Module reference on testnet: cc285180b45d7695db75c29dee004d2e81a1383880c9b122399bea809196c98f
 */
export const WCCD_CONTRACT_INDEX_MAINNET = 9354n;
export const WCCD_CONTRACT_INDEX_TESTNET = 2059n;
