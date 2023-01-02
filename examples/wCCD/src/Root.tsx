import React from 'react';
import { SignClientTypes } from '@walletconnect/types';
import { version } from '../package.json';

import WCCD from './wCCD';
import { WithWalletConnection } from './wallet/WithWalletConnection';
import { TESTNET, WALLET_CONNECT_PROJECT_ID } from './constants';
import { Network } from './wallet/WalletConnection';

const network: Network = TESTNET;
const walletConnectOpts: SignClientTypes.Options = {
    projectId: WALLET_CONNECT_PROJECT_ID,
    metadata: {
        name: 'wCCD',
        description: 'Example dApp for the wCCD token.',
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
            <main className="wccd">
                <WithWalletConnection network={network} walletConnectOpts={walletConnectOpts}>
                    {(props) => <WCCD {...props} />}
                </WithWalletConnection>
                <div>
                    Version: {version} |{' '}
                    <a
                        style={{ color: 'white' }}
                        href="https://developer.concordium.software/en/mainnet/smart-contracts/tutorials/wCCD/index.html"
                        target="_blank"
                        rel="noreferrer"
                    >
                        Learn how to make a wrapper like this
                    </a>
                </div>
            </main>
        </div>
    );
}
