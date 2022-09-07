/* eslint-disable no-console */
import { createContext } from 'react';
import { detectConcordiumProvider } from '@concordium/browser-wallet-api-helpers';
import { AccountTransactionType, GtuAmount, toBuffer } from '@concordium/web-sdk';

export const CONTRACT_NAME_PROXY = 'CIS2-wCCD-Proxy';
export const CONTRACT_NAME_IMPLEMENTATION = 'CIS2-wCCD';
export const CONTRACT_NAME_STATE = 'CIS2-wCCD-State';

/**
 * Action for wrapping some CCD to WCCD in the WCCD smart contract instance
 */

export const wrap = (
    account: string,
    index: bigint,
    setHash: (x: string) => void,
    setError: (x: string) => void,
    setWaitForUser: (x: boolean) => void,
    subindex = 0n,
    amount = 0
) => {
    if (!Number.isInteger(amount) || amount <= 0) {
        setWaitForUser(false);
        return;
    }

    detectConcordiumProvider()
        .then((provider) => {
            provider
                .sendTransaction(
                    account,
                    AccountTransactionType.UpdateSmartContractInstance,
                    {
                        amount: new GtuAmount(BigInt(amount)),
                        contractAddress: {
                            index,
                            subindex,
                        },
                        receiveName: `${CONTRACT_NAME_PROXY}.wrap`,
                        maxContractExecutionEnergy: 30000n,
                        parameter: toBuffer(''),
                    },
                    {
                        data: '',
                        to: {
                            Account: [account],
                        },
                    },
                    '//8BAQAAAA8AAABDSVMyLXdDQ0QtUHJveHkBABQAAgAAABYAAABpbXBsZW1lbnRhdGlvbl9hZGRyZXNzDA0AAABzdGF0ZV9hZGRyZXNzDAEAAAAEAAAAd3JhcAAUAAIAAAACAAAAdG8VAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQIAAAAMFgEEAAAAZGF0YR0B'
                )
                .then((txHash) => {
                    setHash(txHash);
                    setWaitForUser(false);
                })
                .catch((err) => {
                    setError(err);
                    setWaitForUser(false);
                });
        })
        .catch(() => {
            throw new Error('Concordium Wallet API not accessible');
        });
};

/**
 * Action for unwrapping some WCCD to CCD in the WCCD smart contract instance
 */

export const unwrap = (
    account: string,
    index: bigint,
    setHash: (x: string) => void,
    setError: (x: string) => void,
    setWaitForUser: (x: boolean) => void,
    subindex = 0n,
    amount = 0
) => {
    if (!Number.isInteger(amount) || amount <= 0) {
        setWaitForUser(false);
        return;
    }

    detectConcordiumProvider()
        .then((provider) => {
            provider
                .sendTransaction(
                    account,
                    AccountTransactionType.UpdateSmartContractInstance,
                    {
                        amount: new GtuAmount(BigInt(0)),
                        contractAddress: {
                            index,
                            subindex,
                        },
                        receiveName: `${CONTRACT_NAME_PROXY}.unwrap`,
                        maxContractExecutionEnergy: 30000n,
                        parameter: toBuffer(''),
                    },
                    {
                        amount: amount.toString(),
                        data: '',
                        owner: {
                            Account: [account],
                        },
                        receiver: {
                            Account: [account],
                        },
                    },
                    '//8BAQAAAA8AAABDSVMyLXdDQ0QtUHJveHkBABQAAgAAABYAAABpbXBsZW1lbnRhdGlvbl9hZGRyZXNzDA0AAABzdGF0ZV9hZGRyZXNzDAEAAAAGAAAAdW53cmFwABQABAAAAAYAAABhbW91bnQbJQAAAAUAAABvd25lchUCAAAABwAAAEFjY291bnQBAQAAAAsIAAAAQ29udHJhY3QBAQAAAAwIAAAAcmVjZWl2ZXIVAgAAAAcAAABBY2NvdW50AQEAAAALCAAAAENvbnRyYWN0AQIAAAAMFgEEAAAAZGF0YR0B'
                )
                .then((txHash) => {
                    setHash(txHash);
                    setWaitForUser(false);
                })
                .catch((err) => {
                    setError(err);
                    setWaitForUser(false);
                });
        })
        .catch(() => {
            throw new Error('Concordium Wallet API not accessible');
        });
};

/**
 * Global application state.
 */
export type State = {
    isConnected: boolean;
    account: string | undefined;
};

export const state = createContext<State>({ isConnected: false, account: undefined });
