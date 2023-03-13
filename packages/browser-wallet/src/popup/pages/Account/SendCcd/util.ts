import { buildSimpleTransferPayload } from '@popup/shared/utils/transaction-helpers';
import { getMetadataDecimals, TokenIdentifier } from '@shared/utils/token-helpers';
import { ccdToMicroCcd, fractionalToInteger } from 'wallet-common-helpers';
import { ConfirmSimpleTransferState } from './ConfirmSimpleTransfer';
import { ConfirmTokenTransferState } from './ConfirmTokenTransfer';

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
        currentState = buildSimpleTransferPayload(vs.recipient, ccdToMicroCcd(vs.amount));
    }

    return currentState;
};
