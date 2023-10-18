import { createContext } from 'react';
import { AccountTransactionType, CcdAmount, ContractAddress, Energy, ReceiveName } from '@concordium/web-sdk';
import { WalletConnection, moduleSchemaFromBase64 } from '@concordium/react-components';
import { E_SEALING_CONTRACT_NAME, E_SEALING_RAW_SCHEMA } from './constants';

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
            amount: CcdAmount.fromMicroCcd(0),
            address: ContractAddress.create(index, subindex),
            receiveName: ReceiveName.fromString(`${E_SEALING_CONTRACT_NAME}.registerFile`),
            maxContractExecutionEnergy: Energy.create(30000n),
        },
        {
            parameters: fileHashHex,
            schema: moduleSchemaFromBase64(E_SEALING_RAW_SCHEMA),
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
