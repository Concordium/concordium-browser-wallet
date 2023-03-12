/* eslint-disable consistent-return */
import { createContext } from 'react';
import { AccountTransactionType, CcdAmount, UpdateContractPayload } from '@concordium/web-sdk';
import { WalletConnection } from '@concordium/react-components';
import {
    SPONSORED_TX_CONTRACT_NAME,
    SPONSORED_TX_CONTRACT_INDEX,
    CONTRACT_SUB_INDEX,
    SPONSORED_TX_RAW_SCHEMA,
    EXPIRY_TIME_SIGNATURE,
} from './constants';

/**
 * Action for minting a token to the user's account.
 */
export async function mint(connection: WalletConnection, account: string) {
    const test = connection.signAndSendTransaction(
        account,
        AccountTransactionType.Update,
        {
            amount: new CcdAmount(BigInt(0n)),
            address: {
                index: SPONSORED_TX_CONTRACT_INDEX,
                subindex: CONTRACT_SUB_INDEX,
            },
            receiveName: `${SPONSORED_TX_CONTRACT_NAME}.mint`,
            maxContractExecutionEnergy: 30000n,
        } as unknown as UpdateContractPayload,
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        {
            owner: { Account: [account] },
        },
        SPONSORED_TX_RAW_SCHEMA
    );

    return test;
}

/**
 * Action for submitting an transfer sponsored transaction to the cis3_nft smart contract instance.
 */

export async function submitTransferSponsoredTx(
    connection: WalletConnection,
    account: string,
    nonce: number,
    signature: string,
    tokenID: string,
    from: string,
    to: string
) {
    if (nonce === undefined) {
        // eslint-disable-next-line no-alert
        alert('Your account needs to have a nonce. Register a public key to your account.');
        return '';
    }

    if (tokenID === undefined) {
        // eslint-disable-next-line no-alert
        alert('Insert a tokenID.');
        return '';
    }

    if (tokenID.length !== 8) {
        // eslint-disable-next-line no-alert
        alert('TokenID needs to have 8 digits.');
        return '';
    }

    if (signature === undefined || signature === '') {
        // eslint-disable-next-line no-alert
        alert('Insert a signature.');
        return '';
    }

    if (signature.length !== 128) {
        // eslint-disable-next-line no-alert
        alert('Signature needs to have 128 digits.');
        return '';
    }

    if (to === undefined || to === '') {
        // eslint-disable-next-line no-alert
        alert('Insert an `to` address.');
        return '';
    }

    if (from.length !== 50) {
        // eslint-disable-next-line no-alert
        alert('`To` address needs to have 50 digits.');
        return '';
    }
    const message = {
        contract_address: {
            index: Number(SPONSORED_TX_CONTRACT_INDEX),
            subindex: 0,
        },
        entry_point: 'contract_transfer',
        nonce,
        payload: {
            Transfer: [
                [
                    {
                        amount: '1',
                        data: '',
                        from: {
                            Account: [from],
                        },
                        to: {
                            Account: [to],
                        },
                        token_id: tokenID,
                    },
                ],
            ],
        },
        timestamp: EXPIRY_TIME_SIGNATURE,
    };

    const param = {
        message,
        signature: [[0, [[0, signature]]]],
        signer: account,
    };

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
    nonce: number,
    signature: string,
    operator: string,
    addOperator: boolean
) {
    if (nonce === undefined) {
        // eslint-disable-next-line no-alert
        alert('Your account needs to have a nonce. Register a public key to your account.');
        return '';
    }

    if (signature === undefined || signature === '') {
        // eslint-disable-next-line no-alert
        alert('Insert a signature.');
        return '';
    }

    if (signature.length !== 128) {
        // eslint-disable-next-line no-alert
        alert('Signature needs to have 128 digits.');
        return '';
    }

    if (operator === undefined || operator === '') {
        // eslint-disable-next-line no-alert
        alert('Insert an operator address.');
        return '';
    }

    if (operator.length !== 50) {
        // eslint-disable-next-line no-alert
        alert('Operator address needs to have 50 digits.');
        return '';
    }

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
        nonce,
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
        timestamp: EXPIRY_TIME_SIGNATURE,
    };

    const param = {
        message,
        signature: [[0, [[0, signature]]]],
        signer: account,
    };

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
        return '';
    }

    if (publicKey.length !== 64) {
        // eslint-disable-next-line no-alert
        alert('Public key needs to have 64 digits.');
        return '';
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
        } as unknown as UpdateContractPayload,
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
