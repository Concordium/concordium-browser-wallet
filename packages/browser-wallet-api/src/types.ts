import { AccountTransactionType } from '@concordium/web-sdk';

export interface SimpleTransfer {
    type: AccountTransactionType.SimpleTransfer;
    amount: string;
    toAddress: string;
}

export interface UpdateContractNoParameter {
    type: AccountTransactionType.UpdateSmartContractInstance;
    /** µGTU amount to transfer */
    amount: string;
    /** Address of contract instance consisting of an index and a subindex */
    contractAddressIndex: string;
    contractAddressSubindex: string;
    /** Name of receive function including <contractName>. prefix */
    receiveName: string;
    /** The amount of energy that can be used for contract execution.
        The base energy amount for transaction verification will be added to this cost. */
    maxContractExecutionEnergy: string;
    parameter: undefined;
    schema: undefined;
}

export interface UpdateContractParameter extends Omit<UpdateContractNoParameter, 'parameter' | 'schema'> {
    /** Parameters for the update function */
    parameter: Record<string, unknown>;
    schema: string;
}

export type UpdateContract = UpdateContractParameter | UpdateContractNoParameter;

export type SimplifiedAccountTransaction = SimpleTransfer | UpdateContract;
