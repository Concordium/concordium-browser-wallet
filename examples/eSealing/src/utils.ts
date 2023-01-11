/* @typescript-eslint/ban-ts-comment */

import { createContext } from 'react';
import { AccountTransactionType, UpdateContractPayload, CcdAmount } from '@concordium/web-sdk';
import { E_SEALING_CONTRACT_NAME, E_SEALING_RAW_SCHEMA } from './constants';
import { WalletConnection } from './wallet/WalletConnection';

/**
 * Action for registering a new file has in the eSealing smart contract instance
 */
export async function register(
    connection: WalletConnection,
    account: string,
    fileHash: string,
    index: bigint,
    subindex = 0n
) {
    const fileHashByteArray = fileHash.split(',').map((s) => parseInt(s, 10));

    return connection.signAndSendTransaction(
        account,
        AccountTransactionType.Update,
        {
            amount: new CcdAmount(BigInt(0n)),
            address: {
                index,
                subindex,
            },
            receiveName: `${E_SEALING_CONTRACT_NAME}.registerFile`,
            maxContractExecutionEnergy: 30000n,
        } as UpdateContractPayload,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        fileHashByteArray,
        E_SEALING_RAW_SCHEMA
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
