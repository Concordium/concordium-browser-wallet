import {
    AtomicStatement,
    CommitmentInput,
    CryptographicParameters,
    RequestStatement,
    StatementTypes,
    VerifiablePresentationV1,
} from '@concordium/web-sdk';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { ConfirmedIdentity } from '@shared/storage/types';
import { InternalMessageType } from '@messaging';
import { stringify } from '@wallet-api/util';
import { BackgroundResponseStatus, ProofBackgroundResponse } from './types';

export function canProveStatement(statement: AtomicStatement, identity: ConfirmedIdentity) {
    const attribute = identity.idObject.value.attributeList.chosenAttributes[statement.attributeTag];
    if (attribute === undefined) {
        return false;
    }

    switch (statement.type) {
        case StatementTypes.AttributeInSet:
            return statement.set.includes(attribute);
        case StatementTypes.AttributeNotInSet:
            return !statement.set.includes(attribute);
        case StatementTypes.AttributeInRange:
            return statement.upper > attribute && attribute >= statement.lower;
        case StatementTypes.RevealAttribute:
            return true;
        default:
            throw new Error(`Statement type of ${statement.type} is not supported`);
    }
}

/**
 * Helper to prove a Web3 request and get a verifiablePresentation.
 * This returns the presentation as a JSON string.
 */
export async function proveWeb3Request(
    request: {
        challenge: string;
        credentialStatements: (VerifiablePresentationV1.SubjectClaims | RequestStatement)[];
        requestRaw: string;
        proofClaims: (VerifiablePresentationV1.SubjectClaims | RequestStatement)[];
    },
    commitmentInputs: (CommitmentInput | VerifiablePresentationV1.CommitmentInput)[],
    global: CryptographicParameters
) {
    const input = {
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
