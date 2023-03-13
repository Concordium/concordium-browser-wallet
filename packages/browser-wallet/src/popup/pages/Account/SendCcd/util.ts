import { TokenMetadata } from '@shared/storage/types';
import { getMetadataDecimals, TokenIdentifier } from '@shared/utils/token-helpers';
import { ccdToMicroCcd, fractionalToInteger } from 'wallet-common-helpers';

export type CreateTransferFormValues = {
    amount: string;
    recipient: string;
    executionEnergy: string;
    cost: string;
    token?: TokenIdentifier;
};

export const buildConfirmState = (vs: CreateTransferFormValues) => {
    let currentState: ConfirmTokenTransferState | ConfirmSimpleTransferState;
    if (vs.token) {
        currentState = {
            toAddress: vs.recipient,
            amount: fractionalToInteger(vs.amount, getMetadataDecimals(vs.token.metadata)),
            ...vs.token,
            executionEnergy: vs.executionEnergy,
        };
    } else {
        currentState = {
            toAddress: vs.recipient,
            amount: ccdToMicroCcd(vs.amount),
        };
    }
    return currentState;
};

export interface ConfirmSimpleTransferState {
    amount: bigint;
    toAddress: string;
}

export interface ConfirmTokenTransferState extends ConfirmSimpleTransferState {
    contractIndex: string;
    tokenId: string;
    metadata: TokenMetadata;
    executionEnergy: string;
}

export type ConfirmTransferState = ConfirmTokenTransferState | ConfirmTokenTransferState;
