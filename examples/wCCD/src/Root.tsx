/* eslint-disable no-console */
import React, {useEffect, useState, useMemo, useCallback} from 'react';

import {detectConcordiumProvider} from '@concordium/browser-wallet-api-helpers';
import WCCD from './wCCD';
import {state, State} from './utils';
import {TESTNET_GENESIS_BLOCK_HASH} from './constants';

/**
 * Connect to wallet, setup application state context, and render children when the wallet API is ready for use.
 */
export default function Root() {
    // const [account, setAccount] = useState<string>();
    // const [isConnected, setIsConnected] = useState<boolean>(false);
    //
    // const handleGetAccount = useCallback((accountAddress: string | undefined) => {
    //     setAccount(accountAddress);
    //     setIsConnected(Boolean(accountAddress));
    // }, []);
    //
    // const handleNotConnected = useCallback(() => {
    //     setAccount('');
    //     setIsConnected(false);
    // }, []);
    //
    // useEffect(() => {
    //     detectConcordiumProvider()
    //         .then((provider) => {
    //             // Listen for relevant events from the wallet.
    //             provider.on('chainChanged', (genesisBlock) => {
    //                 // Check if the user is connected to testnet by checking if the genesisBlock is the testnet one.
    //                 // Throw a warning and disconnect if wrong chain. We only want to
    //                 // allow users to interact with our testnet smart contracts.
    //                 if (genesisBlock !== TESTNET_GENESIS_BLOCK_HASH) {
    //                     /* eslint-disable no-alert */
    //                     window.alert('Check if your Concordium browser wallet is connected to testnet!');
    //                     handleNotConnected();
    //                 }
    //             });
    //
    //             provider.on('accountChanged', setAccount);
    //             provider.on('accountDisconnected', () =>
    //                 provider.getMostRecentlySelectedAccount().then(handleGetAccount)
    //             );
    //             // Check if you are already connected
    //             provider.getMostRecentlySelectedAccount().then(handleGetAccount);
    //         })
    //         .catch(() => setIsConnected(false));
    // }, []);
    //
    // const stateValue: State = useMemo(() => ({ isConnected, account }), [isConnected, account]);

    return (
        // Setup a globally accessible state with data from the wallet.
        // <state.Provider value={stateValue}>

        <div>
            <script src="../../node_modules/@concordium/web-sdk/lib/concordium.min.js"/>
            <script src="../../packages/browser-wallet-api-helpers/lib/concordiumHelpers.min.js"/>
            <main className="wccd">
                <WCCD />
            </main>
        </div>
        // </state.Provider>
    );
}
