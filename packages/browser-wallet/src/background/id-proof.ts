import {
    getIdProof,
    getVerifiablePresentation,
    IdProofInput,
    IdProofOutput,
    verifyIdstatement,
    Web3IdProofInput,
} from '@concordium/web-sdk';
import { BackgroundResponseStatus, ProofBackgroundResponse } from '@shared/utils/types';
import { ExtensionMessageHandler, MessageStatusWrapper } from '@concordium/browser-wallet-message-hub';
import { isHex } from 'wallet-common-helpers';
import { RunCondition } from './window-management';

async function createIdProof(input: IdProofInput): Promise<ProofBackgroundResponse<IdProofOutput>> {
    const proof = getIdProof(input);
    return {
        status: BackgroundResponseStatus.Success,
        proof,
    };
}

export const createIdProofHandler: ExtensionMessageHandler = (msg, _sender, respond) => {
    createIdProof(msg.payload)
        .then(respond)
        .catch((e) => respond({ status: BackgroundResponseStatus.Error, error: e.toString() }));
    return true;
};

/**
 * Run condition which looks up URL in connected sites for the provided account. Runs handler if URL is included in connected sites.
 */
export const runIfValidProof: RunCondition<MessageStatusWrapper<undefined>> = async (msg) => {
    if (!isHex(msg.payload.challenge)) {
        return {
            run: false,
            response: { success: false, message: `Challenge is invalid, it should be a HEX encoded string` },
        };
    }
    try {
        verifyIdstatement(msg.payload.statement);
        return { run: true };
    } catch (e) {
        return {
            run: false,
            response: { success: false, message: `Id statement is not well-formed: ${(e as Error).message}` },
        };
    }
};

async function createWeb3Proof(input: Web3IdProofInput): Promise<ProofBackgroundResponse<string>> {
    const proof = getVerifiablePresentation(input);
    return {
        status: BackgroundResponseStatus.Success,
        proof: proof.toString(),
    };
}

export const createWeb3ProofHandler: ExtensionMessageHandler = (msg, _sender, respond) => {
    createWeb3Proof(msg.payload)
        .then(respond)
        .catch((e: Error) => respond({ status: BackgroundResponseStatus.Error, error: e.message }));
    return true;
};

/**
 * Run condition which looks up URL in connected sites for the provided account. Runs handler if URL is included in connected sites.
 */
export const runIfValidWeb3IdProof: RunCondition<MessageStatusWrapper<undefined>> = async (msg) => {
    if (!isHex(msg.payload.challenge)) {
        return {
            run: false,
            response: { success: false, message: `Challenge is invalid, it should be a HEX encoded string` },
        };
    }
    try {
        // TODO web3: Check that the request is well-formed
        return { run: true };
    } catch (e) {
        return {
            run: false,
            response: { success: false, message: `Id statement is not well-formed: ${(e as Error).message}` },
        };
    }
};
