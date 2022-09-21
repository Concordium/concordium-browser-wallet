/* eslint-disable no-console */
import { detectConcordiumProvider } from '@concordium/browser-wallet-api-helpers';
import {
    AccountAddress,
    AccountTransactionType,
    AgeProofOutput,
    GtuAmount,
    SimpleTransferPayload,
} from '@concordium/web-sdk';
import { createContext } from 'react';

const FOUNDATION = '3kBx2h5Y2veb4hZgAJWPrr8RyQESKm5TjzF3ti1QQ4VSYLwK1G';
// import { detectConcordiumProvider } from '@concordium/browser-wallet-api-helpers';

/**
 * Action for depositing an amount of microCCD to the piggy bank instance
 */
export const getProof = async (address: string): Promise<AgeProofOutput | undefined> => {
    try {
        const provider = await detectConcordiumProvider();
        return await provider.generateProof(address);
    } catch {
        throw new Error('Concordium Wallet API not accessible');
    }
};

export const getItems = async (): Promise<string[]> => {
    const res = await fetch('http://127.0.0.1:8100/list');
    return res.json();
};

export const getBasket = async (): Promise<string[]> => {
    const res = await fetch('http://127.0.0.1:8100/basket');
    return res.json();
};

const submitPayment = (txHash: string) => {
    return fetch('http://127.0.0.1:8100/pay', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(txHash),
    });
};

export const pay = async (address: string, basket: string[]): Promise<void> => {
    try {
        const provider = await detectConcordiumProvider();
        const trx: SimpleTransferPayload = {
            amount: new GtuAmount(BigInt(basket.length)),
            toAddress: new AccountAddress(FOUNDATION),
        };
        const hash = await provider.sendTransaction(address, AccountTransactionType.SimpleTransfer, trx);

        return await new Promise((resolve, reject) => {
            const timer = setInterval(async () => {
                const res = await fetch(`https://wallet-proxy.testnet.concordium.com/v0/submissionStatus/${hash}`);
                const s = await res.json();

                if (s.status === 'finalized') {
                    const r = await submitPayment(hash);

                    if (r.ok) {
                        resolve();
                    } else {
                        reject();
                    }

                    clearInterval(timer);
                }
            }, 5000);
        });
    } catch {
        throw new Error('Concordium Wallet API not accessible');
    }
};

/**
 * Global application state.
 */
export type State = {
    isConnected: boolean;
    account: string | undefined;
};

export const state = createContext<State>({ isConnected: false, account: undefined });
