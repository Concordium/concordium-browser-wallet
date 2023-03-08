import { createContext } from 'react';
import { AccountTransactionType, CcdAmount, UpdateContractPayload } from '@concordium/web-sdk';
import { WalletConnection } from '@concordium/react-components';
import { SPONSORED_TX_CONTRACT_NAME, SPONSORED_TX_RAW_SCHEMA } from './constants';

/**
 * Action for registering a new file has in the eSealing smart contract instance
 */
export async function register(
    connection: WalletConnection,
    account: string,
    fileHashHex: string,
    index: bigint,
    subindex = 0n
) {
    return connection.signAndSendTransaction(
        account,
        AccountTransactionType.Update,
        {
            amount: new CcdAmount(BigInt(0n)),
            address: {
                index,
                subindex,
            },
            receiveName: `${SPONSORED_TX_CONTRACT_NAME}.registerFile`,
            maxContractExecutionEnergy: 30000n,
        } as UpdateContractPayload,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        fileHashHex,
        SPONSORED_TX_RAW_SCHEMA
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
