import { createContext } from 'react';
import { AccountTransactionType, UpdateContractPayload, CcdAmount } from '@concordium/web-sdk';
import { WalletConnection } from '@concordium/react-components';
import { CONTRACT_NAME, WRAP_FUNCTION_RAW_SCHEMA, UNWRAP_FUNCTION_RAW_SCHEMA } from './constants';

/**
 * Action for wrapping some CCD to WCCD in the WCCD smart contract instance
 */
export async function wrap(
    connection: WalletConnection,
    account: string,
    index: bigint,
    subindex = 0n,
    amount = 0,
    receiver = account
) {
    if (!Number.isInteger(amount) || amount <= 0) {
        throw new Error('invalid amount');
    }

    return connection.signAndSendTransaction(
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
                Account: [receiver],
            },
        },
        WRAP_FUNCTION_RAW_SCHEMA
    );
}

/**
 * Action for unwrapping some WCCD to CCD in the WCCD smart contract instance
 */
export async function unwrap(
    connection: WalletConnection,
    account: string,
    index: bigint,
    subindex = 0n,
    amount = 0,
    receiver = account
) {
    if (!Number.isInteger(amount) || amount <= 0) {
        throw new Error('invalid amount');
    }

    return connection.signAndSendTransaction(
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
                Account: [receiver],
            },
        },
        UNWRAP_FUNCTION_RAW_SCHEMA
    );
}

/**
 * Global application state.
 */
export type State = {
    isConnected: boolean;
    account: string | undefined;
};

export const state = createContext<State>({ isConnected: false, account: undefined });
