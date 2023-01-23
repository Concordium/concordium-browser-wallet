import React from 'react';
import { WithWalletConnector } from '@concordium/react-components';
import { version } from '../package.json';

import WCCD from './wCCD';
import { TESTNET } from './constants';

/**
 * Connect to wallet, setup application state context, and render children when the wallet API is ready for use.
 */
export default function Root() {
    return (
        <div>
            <main className="wccd">
                <WithWalletConnector network={TESTNET}>{(props) => <WCCD {...props} />}</WithWalletConnector>
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
