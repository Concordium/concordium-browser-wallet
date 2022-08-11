/* eslint-disable no-console */
import React, { useEffect, useState, useMemo } from 'react';
import { HttpProvider, JsonRpcClient } from '@concordium/web-sdk';

import { detectConcordiumProvider } from '@concordium/browser-wallet-api-helpers';
import PiggyBankV0 from './Version0';
import PiggyBankV1 from './Version1';
import { state, State } from './utils';

/** This assumes a locally running JSON-RPC server targeting testnet: https://github.com/Concordium/concordium-json-rpc/tree/add-get-instance-info */
const JSON_RPC_URL = 'http://localhost:9095';

const client = new JsonRpcClient(new HttpProvider(JSON_RPC_URL));

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
                provider
                    .connect()
                    .then((acc) => {
                        // Connection accepted, set the application state parameters.
                        setAccount(acc);
                        setIsConnected(true);

                        // Listen for relevant events from the wallet.
                        provider.on('accountChanged', setAccount);
                        provider.on('chainChanged', setJsonRpcUrl);
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
            {isVersion0 && <PiggyBankV0 client={client} />}
            {!isVersion0 && <PiggyBankV1 client={client} />}
        </state.Provider>
    );
}
