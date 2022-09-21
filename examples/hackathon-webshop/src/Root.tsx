/* eslint-disable no-console */
import React, { useEffect, useState, useMemo, useCallback } from 'react';

import { detectConcordiumProvider } from '@concordium/browser-wallet-api-helpers';
import { AgeProofOutput } from '@concordium/web-sdk';
import { getBasket, getItems, getProof, pay, state, State } from './utils';

const ageRestricted = ['Xi', 'Zeta', 'Omega'];
const greekMap: { [key in string]: string } = {
    Alpha: 'α',
    Beta: 'β',
    Gamma: 'γ',
    Xi: 'ξ',
    Zeta: 'ζ',
    Omega: 'ω',
};

const getSymbol = (name: string): string => greekMap[name];

/**
 * Connect to wallet, setup application state context, and render children when the wallet API is ready for use.
 */
export default function Root() {
    const [account, setAccount] = useState<string>();
    const [isConnected, setIsConnected] = useState<boolean>(false);
    const [items, setItems] = useState<string[]>([]);
    const [basket, setBasket] = useState<string[]>([]);
    const [paying, setPaying] = useState<boolean>(false);

    const handleGetAccount = useCallback((accountAddress: string | undefined) => {
        setAccount(accountAddress);
        setIsConnected(Boolean(accountAddress));
    }, []);

    const handleOnClick = useCallback(
        () =>
            detectConcordiumProvider()
                .then((provider) => provider.connect())
                .then(handleGetAccount),
        []
    );

    const refreshBasket = () => {
        getBasket().then(setBasket);
    };

    useEffect(() => {
        getItems().then(setItems);
        refreshBasket();
    }, []);

    const addToBasket = async (item: string) => {
        if (account === undefined) {
            return;
        }

        const req: { item: string; proof?: AgeProofOutput } = {
            item,
        };

        if (ageRestricted.includes(item)) {
            req.proof = await getProof(account);
        }

        const updatedBasket: string[] = await fetch('http://127.0.0.1:8100/add', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(req),
        }).then((r) => {
            if (r.ok) {
                return r.json();
            }

            // eslint-disable-next-line no-alert
            alert("Sorry, you're not old enough to buy adult letters");
            return basket;
        });

        setBasket(updatedBasket);
    };

    const handlePaymentSubmissionResponse = () => {
        refreshBasket();
        // eslint-disable-next-line no-alert
        alert('Your payment has been accepted. Your letters will arrive within 2-3 working days');
    };

    const handlePaymentRejection = () => {
        // eslint-disable-next-line no-alert
        alert('Payment was done from an invalid account.');
    };

    useEffect(() => {
        detectConcordiumProvider()
            .then((provider) => {
                // Listen for relevant events from the wallet.
                provider.on('accountChanged', setAccount);
                provider.on('accountDisconnected', () =>
                    provider.getMostRecentlySelectedAccount().then(handleGetAccount)
                );
                provider.on('chainChanged', (chain) => console.log(chain));
                // Check if you are already connected
                provider.getMostRecentlySelectedAccount().then(handleGetAccount);
            })
            .catch(() => setIsConnected(false));
    }, []);

    const stateValue: State = useMemo(() => ({ isConnected, account }), [isConnected, account]);

    return (
        // Setup a globally accessible state with data from the wallet.
        <state.Provider value={stateValue}>
            <main className="webshop">
                <div className={`connection-banner ${isConnected ? 'connected' : ''}`}>
                    {isConnected && `Connected: ${account?.slice(0, 8)}`}
                    {!isConnected && (
                        <>
                            <p>No wallet connection</p>
                            <button type="button" onClick={handleOnClick}>
                                Connect
                            </button>
                        </>
                    )}
                </div>
                <h1>Welcome to the Greek Letter Shop!</h1>
                <h3 style={{ color: 'red' }}>Super Sale: only 0.000001 CCD per letter</h3>
                <div className="basket">
                    Basket:
                    {basket.map((i) => (
                        <div>{getSymbol(i)}</div>
                    ))}
                    {account !== undefined && basket.length !== 0 && (
                        <button
                            style={{ display: 'block' }}
                            type="button"
                            disabled={paying}
                            onClick={() => {
                                setPaying(true);
                                pay(account, basket)
                                    .then(handlePaymentSubmissionResponse)
                                    .catch(handlePaymentRejection)
                                    .finally(() => setPaying(false));
                            }}
                        >
                            Pay
                        </button>
                    )}
                </div>
                <div>
                    {items.map((i) => (
                        <button className="item" type="button" onClick={() => addToBasket(i)}>
                            {getSymbol(i)} {ageRestricted.includes(i) ? '(>=18)' : ''}
                        </button>
                    ))}
                </div>
            </main>
        </state.Provider>
    );
}
