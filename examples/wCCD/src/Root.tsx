/* eslint-disable no-console */
import React from 'react';
import WCCD from './wCCD';

/**
 * Connect to wallet, setup application state context, and render children when the wallet API is ready for use.
 */
export default function Root() {
    return (
        <div>
            <script src="../../node_modules/@concordium/web-sdk/lib/concordium.min.js"/>
            <script src="../../packages/browser-wallet-api-helpers/lib/concordiumHelpers.min.js"/>
            <main className="wccd">
                <WCCD />
            </main>
        </div>
    );
}
