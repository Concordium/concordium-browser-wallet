/* eslint-disable no-console */
import React, { useEffect, useState, useMemo, useCallback } from 'react';

import { detectConcordiumProvider } from '@concordium/browser-wallet-api-helpers';
import WCCD from './wCCD';
import { state, State } from './utils';

/**
 * Connect to wallet, setup application state context, and render children when the wallet API is ready for use.
 */
export default function Root() {
    const [account, setAccount] = useState<string>();
    const [isConnected, setIsConnected] = useState<boolean>(false);

    const handleGetAccount = useCallback((accountAddress: string | undefined) => {
        setAccount(accountAddress);
        setIsConnected(Boolean(accountAddress));
    }, []);

    useEffect(() => {
        detectConcordiumProvider()
            .then((provider) => {
                // Listen for relevant events from the wallet.
                provider.on('accountChanged', setAccount);
                provider.on('accountDisconnected', () =>
                    provider.getMostRecentlySelectedAccount().then(handleGetAccount)
                );
                // Check if you are already connected
                provider.getMostRecentlySelectedAccount().then(handleGetAccount);
            })
            .catch(() => setIsConnected(false));
    }, []);

    const stateValue: State = useMemo(() => ({ isConnected, account }), [isConnected, account]);

    return (
        // Setup a globally accessible state with data from the wallet.
        <state.Provider value={stateValue}>
            <script src="../../node_modules/@concordium/web-sdk/lib/concordium.min.js" />
            <script src="../../packages/browser-wallet-api-helpers/lib/concordiumHelpers.min.js" />
            <main className="wccd">
                <WCCD handleGetAccount={handleGetAccount} />
            </main>
        </state.Provider>
    );
}
