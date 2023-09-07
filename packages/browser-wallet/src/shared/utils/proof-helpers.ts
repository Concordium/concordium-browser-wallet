import {
    AtomicStatement,
    CommitmentInput,
    CryptographicParameters,
    StatementTypes,
    Web3IdProofInput,
    Web3IdProofRequest,
} from '@concordium/web-sdk';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { ConfirmedIdentity } from '@shared/storage/types';
import { InternalMessageType } from '@concordium/browser-wallet-message-hub';
import { stringify } from '@concordium/browser-wallet-api/src/util';
import { BackgroundResponseStatus, ProofBackgroundResponse } from './types';

export function canProveStatement(statement: AtomicStatement, identity: ConfirmedIdentity) {
    const attribute = identity.idObject.value.attributeList.chosenAttributes[statement.attributeTag];

    switch (statement.type) {
        case StatementTypes.AttributeInSet:
            return statement.set.includes(attribute);
        case StatementTypes.AttributeNotInSet:
            return !statement.set.includes(attribute);
        case StatementTypes.AttributeInRange:
            return statement.upper > attribute && attribute >= statement.lower;
        case StatementTypes.RevealAttribute:
            return attribute !== undefined;
        default:
            throw new Error(`Statement type of ${statement.type} is not supported`);
    }
}

/**
 * Helper to prove a Web3 request and get a verifiablePresentation.
 * This returns the presentation as a JSON string.
 */
export async function proveWeb3Request(
    request: Web3IdProofRequest,
    commitmentInputs: CommitmentInput[],
    global: CryptographicParameters
) {
    const input: Web3IdProofInput = {
        request,
        commitmentInputs,
        globalContext: global,
    };

    const result: ProofBackgroundResponse<string> = await popupMessageHandler.sendInternalMessage(
        InternalMessageType.CreateWeb3IdProof,
        stringify(input)
    );

    if (result.status !== BackgroundResponseStatus.Success) {
        throw new Error(result.reason);
    }
    return result.proof;
}
