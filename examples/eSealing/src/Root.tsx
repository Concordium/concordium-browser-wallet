import React from 'react';

import { WithWalletConnector } from '@concordium/react-components';
import SEALING from './eSealing';
import { TESTNET } from './constants';

/**
 * Connect to wallet, setup application state context, and render children when the wallet API is ready for use.
 */
export default function Root() {
    return (
        <div>
            <main className="eSealing">
                <WithWalletConnector network={TESTNET}>{(props) => <SEALING {...props} />}</WithWalletConnector>
            </main>
        </div>
    );
}
