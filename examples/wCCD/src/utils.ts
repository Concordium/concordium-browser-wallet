import { createContext } from 'react';
import { AccountTransactionType, CcdAmount, ContractAddress, Energy, ReceiveName } from '@concordium/web-sdk';
import { WalletConnection, moduleSchemaFromBase64 } from '@concordium/react-components';
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

    const parameter = {
        data: '',
        to: {
            Account: [receiver],
        },
    };

    return connection.signAndSendTransaction(
        account,
        AccountTransactionType.Update,
        {
            amount: CcdAmount.fromMicroCcd(BigInt(amount)),
            address: ContractAddress.create(index, subindex),
            receiveName: ReceiveName.fromString(`${CONTRACT_NAME}.wrap`),
            maxContractExecutionEnergy: Energy.create(30000),
        },
        {
            parameters: parameter,
            schema: moduleSchemaFromBase64(WRAP_FUNCTION_RAW_SCHEMA),
        }
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

    const parameter = {
        amount: amount.toString(),
        data: '',
        owner: {
            Account: [account],
        },
        receiver: {
            Account: [receiver],
        },
    };

    return connection.signAndSendTransaction(
        account,
        AccountTransactionType.Update,
        {
            amount: CcdAmount.fromMicroCcd(BigInt(0)),
            address: ContractAddress.create(index, subindex),
            receiveName: ReceiveName.fromString(`${CONTRACT_NAME}.unwrap`),
            maxContractExecutionEnergy: Energy.create(30000),
        },
        {
            parameters: parameter,
            schema: moduleSchemaFromBase64(UNWRAP_FUNCTION_RAW_SCHEMA),
        }
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
