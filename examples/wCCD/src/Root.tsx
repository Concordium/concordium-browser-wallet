import React from 'react';
import { Network, WithWalletConnector } from '@concordium/react-components';
import { version } from '../package.json';

import WCCD from './wCCD';
import { MAINNET, TESTNET } from './constants';

/**
 * Connect to wallet, setup application state context, and render children when the wallet API is ready for use.
 */
export default function Root() {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const testnet = 'testnet';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const mainnet = 'mainnet';
    let NETWORK: Network = MAINNET;

    if (process.env.network === 'mainnet') {
        NETWORK = MAINNET;
    } else if (process.env.network === 'testnet') {
        NETWORK = TESTNET;
    } else {
        // return Error('NETWORK needs to be defined');
    }

    return (
        <div>
            <main className="wccd">
                <WithWalletConnector network={NETWORK}>{(props) => <WCCD {...props} />}</WithWalletConnector>
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
