import React from 'react';
import { SignClientTypes } from '@walletconnect/types';

import { Network, WithWalletConnector } from '@concordium/react-components';
import SEALING from './eSealing';
import { TESTNET, WALLET_CONNECT_PROJECT_ID } from './constants';

const network: Network = TESTNET;
const walletConnectOpts: SignClientTypes.Options = {
    projectId: WALLET_CONNECT_PROJECT_ID,
    metadata: {
        name: 'eSealing',
        description: 'Example dApp for the eSealing a file.',
        url: '#',
        icons: ['https://walletconnect.com/walletconnect-logo.png'],
    },
};

/**
 * Connect to wallet, setup application state context, and render children when the wallet API is ready for use.
 */
export default function Root() {
    return (
        <div>
            <script src="../../node_modules/@concordium/web-sdk/lib/concordium.min.js" />
            <script src="../../packages/browser-wallet-api-helpers/lib/concordiumHelpers.min.js" />
            <main className="eSealing">
                <WithWalletConnector network={network} walletConnectOpts={walletConnectOpts}>
                    {(props) => <SEALING {...props} />}
                </WithWalletConnector>
            </main>
        </div>
    );
}
