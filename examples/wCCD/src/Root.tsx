import React from 'react';
import WCCD from './wCCD';
import {WithWalletConnection} from "./wallet/WithWalletConnection";
import {TESTNET} from "./constants";

const network = TESTNET;
const walletConnectOpts = {

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
                    {
                        (activeConnection, ) =>
                            <WCCD activeConnection={} />
                    }

                </WithWalletConnection>
            </main>
        </div>
    );
}
