import { createContext } from 'react';
import {
    AccountAddress,
    AccountTransactionType,
    CcdAmount,
    ConcordiumGRPCClient,
    ContractAddress,
    ContractName,
    EntrypointName,
    ReceiveName,
    serializeUpdateContractParameters,
} from '@concordium/web-sdk';
import { WalletConnection, moduleSchemaFromBase64 } from '@concordium/react-components';
import { E_SEALING_CONTRACT_NAME, E_SEALING_RAW_SCHEMA } from './constants';

/**
 * Action for registering a new file has in the eSealing smart contract instance
 */
export async function register(
    connection: WalletConnection,
    grpcClient: ConcordiumGRPCClient,
    account: string,
    fileHashHex: string,
    index: bigint,
    subindex = 0n
) {
    const contractAddress = ContractAddress.create(index, subindex);
    const receiveName = ReceiveName.fromString(`${E_SEALING_CONTRACT_NAME}.registerFile`);

    const schema = moduleSchemaFromBase64(E_SEALING_RAW_SCHEMA);
    const serializedParameters = serializeUpdateContractParameters(
        ContractName.fromString(E_SEALING_CONTRACT_NAME),
        EntrypointName.fromString('registerFile'),
        fileHashHex,
        schema.value
    );

    const invokeResult = await grpcClient.invokeContract({
        contract: contractAddress,
        method: receiveName,
        invoker: AccountAddress.fromBase58(account),
        parameter: serializedParameters,
    });

    if (invokeResult.tag === 'failure') {
        throw Error('Transaction would fail!');
    }

    return connection.signAndSendTransaction(
        account,
        AccountTransactionType.Update,
        {
            amount: CcdAmount.fromMicroCcd(0),
            address: contractAddress,
            receiveName,
            maxContractExecutionEnergy: invokeResult.usedEnergy,
        },
        {
            parameters: fileHashHex,
            schema,
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
