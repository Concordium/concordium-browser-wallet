/* eslint-disable no-console */
import { createContext } from 'react';
import { detectConcordiumProvider } from '@concordium/browser-wallet-api-helpers';
import { AccountTransactionType, UpdateContractPayload, CcdAmount } from '@concordium/web-sdk';
import { CONTRACT_NAME, WRAP_FUNCTION_RAW_SCHEMA, UNWRAP_FUNCTION_RAW_SCHEMA } from './constants';
import { WalletConnection } from "./wallet/WalletConnection";

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
                    AccountTransactionType.Update,
                    {
                        amount: new CcdAmount(BigInt(amount)),
                        address: {
                            index,
                            subindex,
                        },
                        receiveName: `${CONTRACT_NAME}.wrap`,
                        maxContractExecutionEnergy: 30000n,
                    } as UpdateContractPayload,
                    {
                        data: '',
                        to: {
                            Account: [account],
                        },
                    },
                    WRAP_FUNCTION_RAW_SCHEMA
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

export async function unwrap(
    connection: WalletConnection,
    account: string,
    index: bigint,
    setHash: (x: string) => void,
    setError: (x: string) => void,
    setWaitForUser: (x: boolean) => void,
    subindex = 0n,
    amount = 0
) {
    if (!Number.isInteger(amount) || amount <= 0) {
        setWaitForUser(false);
        return;
    }

    connection.signAndSendTransaction(
        account,
        AccountTransactionType.Update,
        {
            amount: new CcdAmount(BigInt(0)),
            address: {
                index,
                subindex,
            },
            receiveName: `${CONTRACT_NAME}.unwrap`,
            maxContractExecutionEnergy: 30000n,
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
        UNWRAP_FUNCTION_RAW_SCHEMA
    )

    detectConcordiumProvider()
        .then((provider) => {
            provider
                .sendTransaction(
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
