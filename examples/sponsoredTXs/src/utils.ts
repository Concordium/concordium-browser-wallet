/* eslint-disable consistent-return */
import { createContext } from 'react';
import { AccountTransactionType, CcdAmount, UpdateContractPayload } from '@concordium/web-sdk';
import { WalletConnection } from '@concordium/react-components';
import {
    SPONSORED_TX_CONTRACT_NAME,
    SPONSORED_TX_CONTRACT_INDEX,
    CONTRACT_SUB_INDEX,
    SPONSORED_TX_RAW_SCHEMA,
} from './constants';

/**
 * Action for submitting an transfer sponsored transaction to the cis3_nft smart contract instance.
 */

export async function submitTransferSponsoredTx(
    connection: WalletConnection,
    account: string,
    signature: string,
    amount: string,
    from: string,
    to: string
) {
    const message = {
        contract_address: {
            index: Number(SPONSORED_TX_CONTRACT_INDEX),
            subindex: 0,
        },
        entry_point: 'contract_transfer',
        nonce: 1,
        payload: {
            Transfer: [
                [
                    {
                        amount,
                        data: '',
                        from: {
                            Account: [from],
                        },
                        to: {
                            Account: [to],
                        },
                        token_id: '00000006', // TODO: this has to be input via a input field
                    },
                ],
            ],
        },
        timestamp: '2030-08-08T05:15:00Z',
    };

    const param = {
        message,
        signature: [[0, [[0, signature]]]],
        signer: account,
    };

    // if (publicKey === undefined || publicKey === '') {
    //     // eslint-disable-next-line no-alert
    //     alert('Insert a public key.');
    //     return;
    // }

    // if (publicKey.length !== 64) {
    //     // eslint-disable-next-line no-alert
    //     alert('Public key needs to have 64 digits.');
    //     return;
    // }

    return connection.signAndSendTransaction(
        account,
        AccountTransactionType.Update,
        {
            amount: new CcdAmount(BigInt(0n)),
            address: {
                index: SPONSORED_TX_CONTRACT_INDEX,
                subindex: CONTRACT_SUB_INDEX,
            },
            receiveName: `${SPONSORED_TX_CONTRACT_NAME}.permit`,
            maxContractExecutionEnergy: 30000n,
        } as unknown as UpdateContractPayload,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        param,
        SPONSORED_TX_RAW_SCHEMA
    );
}

/**
 * Action for submitting an update operator sponsored transaction to the cis3_nft smart contract instance.
 */

export async function submitUpdateOperatorSponsoredTx(
    connection: WalletConnection,
    account: string,
    signature: string,
    operator: string,
    addOperator: boolean
) {
    const operatorAction = addOperator
        ? {
              Add: [],
          }
        : {
              Remove: [],
          };

    const message = {
        contract_address: {
            index: Number(SPONSORED_TX_CONTRACT_INDEX),
            subindex: 0,
        },
        entry_point: 'contract_update_operator',
        nonce: 1, // TODO: get the up to date nonce
        payload: {
            UpdateOperator: [
                [
                    {
                        operator: {
                            Account: [operator],
                        },
                        update: operatorAction,
                    },
                ],
            ],
        },
        timestamp: '2030-08-08T05:15:00Z', // TODO make this a constant variable
    };

    const param = {
        message,
        signature: [[0, [[0, signature]]]],
        signer: account,
    };

    // if (publicKey === undefined || publicKey === '') {
    //     // eslint-disable-next-line no-alert
    //     alert('Insert a public key.');
    //     return;
    // }

    // if (publicKey.length !== 64) {
    //     // eslint-disable-next-line no-alert
    //     alert('Public key needs to have 64 digits.');
    //     return;
    // }

    return connection.signAndSendTransaction(
        account,
        AccountTransactionType.Update,
        {
            amount: new CcdAmount(BigInt(0n)),
            address: {
                index: SPONSORED_TX_CONTRACT_INDEX,
                subindex: CONTRACT_SUB_INDEX,
            },
            receiveName: `${SPONSORED_TX_CONTRACT_NAME}.permit`,
            maxContractExecutionEnergy: 30000n,
        } as unknown as UpdateContractPayload,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        param,
        SPONSORED_TX_RAW_SCHEMA
    );
}

/**
 * Action for registering a public key in the cis3_nft smart contract instance.
 */
export async function register(connection: WalletConnection, account: string, publicKey: string) {
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
                index: SPONSORED_TX_CONTRACT_INDEX,
                subindex: CONTRACT_SUB_INDEX,
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
