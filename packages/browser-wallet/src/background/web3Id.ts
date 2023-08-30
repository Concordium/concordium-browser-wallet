import {
    CredentialStatements,
    getVerifiablePresentation,
    Web3IdProofInput,
    createConcordiumClient,
    verifyWeb3IdCredentialSignature,
    isHex,
    verifyAtomicStatements,
    isAccountCredentialStatement,
    IDENTITY_SUBJECT_SCHEMA,
} from '@concordium/web-sdk';
import {
    sessionVerifiableCredentials,
    storedCurrentNetwork,
    storedVerifiableCredentials,
    useIndexedStorage,
} from '@shared/storage/access';

import { CredentialProof, APIVerifiableCredential } from '@concordium/browser-wallet-api-helpers';
import { GRPCTIMEOUT } from '@shared/constants/networkConfiguration';
import { VerifiableCredential } from '@shared/storage/types';
import { addToList, removeFromList, web3IdCredentialLock } from '@shared/storage/update';
import {
    getCredentialRegistryContractAddress,
    getCredentialRegistryIssuerKey,
    getDIDNetwork,
    getPublicKeyfromPublicKeyIdentifierDID,
} from '@shared/utils/verifiable-credential-helpers';
import { parse } from '@shared/utils/payload-helpers';
import { BackgroundResponseStatus, ProofBackgroundResponse } from '@shared/utils/types';
import {
    ExtensionMessageHandler,
    InternalMessageType,
    MessageStatusWrapper,
} from '@concordium/browser-wallet-message-hub';
import { getNet } from '@shared/utils/network-helpers';
import { WAIT_FOR_CLOSED_POPUP_ITERATIONS, WAIT_FOR_CLOSED_POPUP_TIMEOUT_MS } from '@shared/constants/web3id';
import { Buffer } from 'buffer/';
import { openWindow, RunCondition, testPopupOpen } from './window-management';
import bgMessageHandler from './message-handler';

const NO_CREDENTIALS_FIT = 'No temporary credentials fit the given id';
const INVALID_CREDENTIAL_PROOF = 'Invalid credential proof given';
const MISSING_CREDENTIAL_PROOF = 'No credential proof given';

const MAX_U64 = 2n ** 64n;
const MIN_DATE_ISO = '-262144-01-01T00:00:00Z';
const MAX_DATE_ISO = '+262143-12-31T23:59:59.999999999Z';
const MIN_DATE_TIMESTAMP = Date.parse(MIN_DATE_ISO);
const MAX_DATE_TIMESTAMP = Date.parse(MAX_DATE_ISO);

export async function web3IdAddCredentialFinishHandler(input: {
    credentialHolderIdDID: string;
    proof: CredentialProof;
    randomness: Record<number, string>;
}): Promise<void> {
    const { credentialHolderIdDID, proof, randomness } = input;

    const network = await storedCurrentNetwork.get();

    if (!network) {
        throw new Error('No network chosen');
    }

    const { genesisHash } = network;
    const tempCredentials = await sessionVerifiableCredentials.get(genesisHash);

    if (!tempCredentials) {
        throw new Error(NO_CREDENTIALS_FIT);
    }

    const saved = tempCredentials.find((cred) => cred.credentialSubject.id === credentialHolderIdDID);

    if (!saved) {
        throw new Error(NO_CREDENTIALS_FIT);
    }

    const client = createConcordiumClient(network.grpcUrl, network.grpcPort, { timeout: GRPCTIMEOUT });
    const issuerContract = getCredentialRegistryContractAddress(saved.issuer);

    if (!proof || !proof.proofValue) {
        throw new Error(MISSING_CREDENTIAL_PROOF);
    }

    if (
        !verifyWeb3IdCredentialSignature({
            globalContext: await client.getCryptographicParameters(),
            signature: proof.proofValue,
            randomness,
            values: saved.credentialSubject.attributes,
            issuerContract,
            issuerPublicKey: await getCredentialRegistryIssuerKey(client, issuerContract),
            holder: getPublicKeyfromPublicKeyIdentifierDID(saved.credentialSubject.id),
        })
    ) {
        throw new Error(INVALID_CREDENTIAL_PROOF);
    }

    const credential: VerifiableCredential = {
        ...saved,
        signature: proof.proofValue,
        randomness,
    };

    await addToList(
        web3IdCredentialLock,
        credential,
        useIndexedStorage(storedVerifiableCredentials, () => Promise.resolve(genesisHash))
    );

    removeFromList(
        web3IdCredentialLock,
        (cred) => cred.credentialSubject.id === credentialHolderIdDID,
        useIndexedStorage(sessionVerifiableCredentials, () => Promise.resolve(genesisHash))
    );
}

function rejectRequest(message: string): { run: false; response: MessageStatusWrapper<undefined> } {
    return {
        run: false,
        response: { success: false, message },
    };
}

/**
 * Run condition which ensures that the web3IdCredential request is valid.
 */
export const runIfValidWeb3IdCredentialRequest: RunCondition<MessageStatusWrapper<undefined>> = async (msg) => {
    const credential: APIVerifiableCredential = parse(msg.payload.credential);
    const network = await storedCurrentNetwork.get();

    if (!network) {
        throw new Error('No network chosen');
    }

    const net = getNet(network);

    try {
        if (
            !credential.type.includes('VerifiableCredential') ||
            !credential.type.includes('ConcordiumVerifiableCredential')
        ) {
            return rejectRequest('Credential does not have the correct type');
        }

        const credNetwork = getDIDNetwork(credential.issuer);
        if (net.toLowerCase() !== credNetwork) {
            return rejectRequest(`Credential issuer network is not the same as the current wallet network`);
        }

        for (const attributeEntry of Object.entries(credential.credentialSubject.attributes)) {
            const attributeKey = attributeEntry[0];
            const attributeValue = attributeEntry[1];
            if (typeof attributeValue === 'string' && Buffer.from(attributeValue, 'utf-8').length > 31) {
                return rejectRequest(
                    `The attribute [${attributeValue}] for key [${attributeKey}] is greater than 31 bytes.`
                );
            }
            if (typeof attributeValue === 'bigint' && (attributeValue < 0 || attributeValue > MAX_U64)) {
                return rejectRequest(
                    `The attribute [${attributeValue}] for key [${attributeKey}] is out of bounds for a u64 integer.`
                );
            }
            if (
                attributeValue instanceof Date &&
                (attributeValue.getTime() < MIN_DATE_TIMESTAMP || attributeValue.getTime() > MAX_DATE_TIMESTAMP)
            ) {
                return rejectRequest(
                    `The attribute [${attributeValue}] for key [${attributeKey}] is out of bounds for a Date. The Date must be between ${MIN_DATE_ISO} and ${MAX_DATE_ISO}`
                );
            }
        }

        return { run: true };
    } catch (e) {
        return rejectRequest(`Credential is not well-formed: ${(e as Error).message}`);
    }
};

async function createWeb3Proof(input: Web3IdProofInput): Promise<ProofBackgroundResponse<string>> {
    const proof = getVerifiablePresentation(input);
    return {
        status: BackgroundResponseStatus.Success,
        proof: proof.toString(),
    };
}

export const createWeb3IdProofHandler: ExtensionMessageHandler = (msg, _sender, respond) => {
    createWeb3Proof(parse(msg.payload))
        .then(respond)
        .catch((e: Error) => respond({ status: BackgroundResponseStatus.Error, error: e.message }));
    return true;
};

export const runIfValidWeb3IdProof: RunCondition<MessageStatusWrapper<undefined>> = async (msg) => {
    if (!isHex(msg.payload.challenge)) {
        return rejectRequest(`Challenge is invalid, it should be a HEX encoded string`);
    }
    try {
        const statements: CredentialStatements = parse(msg.payload.statements);
        // If a statement does not verify, an error is thrown.
        statements.every((credStatement) =>
            isAccountCredentialStatement(credStatement)
                ? verifyAtomicStatements(credStatement.statement, IDENTITY_SUBJECT_SCHEMA)
                : verifyAtomicStatements(credStatement.statement)
        );

        const noEmptyQualifier = statements.every((credStatement) => credStatement.idQualifier.issuers.length > 0);
        if (!noEmptyQualifier) {
            return rejectRequest(`Statements must have at least 1 possible identity provider / issuer`);
        }
        return { run: true };
    } catch (e) {
        return rejectRequest(`Statement is not well-formed: ${(e as Error).message}`);
    }
};

/**
 * Wait until there are no popups open, or until the number of iterations supplied
 * have been waited out. One check is attempted every 100ms.
 *
 * NOTE: We do this because we have found no better way to wait for the extension
 * window to be closed from the verifiable credential list. It signals the background
 * script and then closes, but it can take some time for it to close.
 * @param waitIterations number of iterations before escaping the waiting
 */
async function waitForClosedPopup(waitIterations: number): Promise<void> {
    return new Promise<void>((resolve, reject) => {
        let escapeCounter = 0;
        setTimeout(async function waitForClosed() {
            const isOpen = await testPopupOpen();
            if (!isOpen) {
                resolve();
            } else {
                if (escapeCounter > waitIterations) {
                    reject();
                }
                escapeCounter += 1;
                setTimeout(waitForClosed, WAIT_FOR_CLOSED_POPUP_TIMEOUT_MS);
            }
        }, WAIT_FOR_CLOSED_POPUP_TIMEOUT_MS);
    });
}

async function loadWeb3IdBackup(): Promise<void> {
    await waitForClosedPopup(WAIT_FOR_CLOSED_POPUP_ITERATIONS);
    await openWindow();
    bgMessageHandler.sendInternalMessage(InternalMessageType.ImportWeb3IdBackup);
}

export const loadWeb3IdBackupHandler: ExtensionMessageHandler = (_msg, _sender, respond) => {
    loadWeb3IdBackup();
    respond(undefined);
};
