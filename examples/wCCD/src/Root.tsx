import React from 'react';
import { Network, WithWalletConnector } from '@concordium/react-components';
import { version } from '../package.json';

import WCCD from './wCCD';
import { TESTNET } from './constants';

const network: Network = TESTNET;

/**
 * Connect to wallet, setup application state context, and render children when the wallet API is ready for use.
 */
export default function Root() {
    return (
        <div>
            <script src="../../node_modules/@concordium/web-sdk/lib/concordium.min.js" />
            <script src="../../packages/browser-wallet-api-helpers/lib/concordiumHelpers.min.js" />
            <main className="wccd">
                <WithWalletConnector network={network}>{(props) => <WCCD {...props} />}</WithWalletConnector>
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
