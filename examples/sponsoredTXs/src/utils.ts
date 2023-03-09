/* eslint-disable consistent-return */
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
    publicKey: string,
    index: bigint,
    subindex = 0n
) {
    if (publicKey === undefined || publicKey === '') {
        // eslint-disable-next-line no-alert
        alert('Insert a public key.');
        return;
    }

    if (publicKey.length !== 64) {
        // eslint-disable-next-line no-alert
        alert('Public key needs to have 64 digits.');
        return;
    }

    return connection.signAndSendTransaction(
        account,
        AccountTransactionType.Update,
        {
            amount: new CcdAmount(BigInt(0n)),
            address: {
                index,
                subindex,
            },
            receiveName: `${SPONSORED_TX_CONTRACT_NAME}.registerPublicKeys`,
            maxContractExecutionEnergy: 30000n,
        } as UpdateContractPayload,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        [
            [
                {
                    account,
                    public_key: publicKey,
                },
            ],
        ],
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
