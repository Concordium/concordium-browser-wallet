/* eslint-disable no-console */
import React, { useEffect, useState, useMemo } from 'react';

import { detectConcordiumProvider } from '@concordium/browser-wallet-api-helpers';
import PiggyBankV0 from './Version0';
import PiggyBankV1 from './Version1';
import { state, State } from './utils';

/**
 * Connect to wallet, setup application state context, and render children when the wallet API is ready for use.
 */
export default function Root() {
    const [account, setAccount] = useState<string>();
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [isVersion0, setIsVersion0] = useState<boolean>(false);
    const [jsonRpcUrl, setJsonRpcUrl] = useState<string>();

    useEffect(() => {
        detectConcordiumProvider()
            .then((provider) => {
                // Listen for relevant events from the wallet.
                provider.on('accountChanged', setAccount);
                provider.on('accountDisconnected', () => {
                    setAccount(undefined);
                    setIsConnected(false);
                    provider.connect().then((accountAddress) => {
                        setAccount(accountAddress);
                        setIsConnected(true);
                    });
                });
                provider.on('chainChanged', setJsonRpcUrl);

                provider
                    .connect()
                    .then((acc) => {
                        // Connection accepted, set the application state parameters.
                        setAccount(acc);
                        setIsConnected(true);
                    })
                    .catch(() => setIsConnected(false));
            })
            .catch(() => setIsConnected(false));
    }, []);

    const stateValue: State = useMemo(() => ({ isConnected, account, jsonRpcUrl }), [isConnected, account, jsonRpcUrl]);

    return (
        // Setup a globally accessible state with data from the wallet.
        <state.Provider value={stateValue}>
            <button type="button" onClick={() => setIsVersion0((v) => !v)}>
                Switch to {isVersion0 ? 'V1' : 'V0'}
            </button>
            {isVersion0 && <PiggyBankV0 />}
            {!isVersion0 && <PiggyBankV1 />}
        </state.Provider>
    );
}
