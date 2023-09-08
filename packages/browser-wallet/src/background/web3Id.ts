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
    verifyIdstatement,
    IdStatement,
    StatementTypes,
    AttributeType,
    isTimestampAttribute,
    TimestampAttribute,
    AttributeKeyString,
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
import { isAgeStatement, SecretStatement } from '@popup/pages/IdProofRequest/DisplayStatement/utils';
import { logError } from '@shared/utils/log-helpers';
import { openWindow, RunCondition, testPopupOpen } from './window-management';
import bgMessageHandler from './message-handler';

const NO_CREDENTIALS_FIT = 'No temporary credentials fit the given id';
const INVALID_CREDENTIAL_PROOF = 'Invalid credential proof given';
const MISSING_CREDENTIAL_PROOF = 'No credential proof given';

const MAX_U64 = 2n ** 64n - 1n;
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

// TODO Expose function from SDK and re-use.
function timestampToDate(attribute: TimestampAttribute): Date {
    return new Date(Date.parse(attribute.timestamp));
}

function validateTimestampAttribute(attributeTag: string, attributeValue: AttributeType) {
    if (isTimestampAttribute(attributeValue)) {
        const timestamp = timestampToDate(attributeValue).getTime();
        if (Number.isNaN(timestamp)) {
            return `The attribute [${attributeValue.timestamp}] for key [${attributeTag}] cannot be parsed as a Date.`;
        }

        if (timestamp < MIN_DATE_TIMESTAMP || timestamp > MAX_DATE_TIMESTAMP) {
            return `The attribute [${attributeValue.timestamp}] for key [${attributeTag}] is out of bounds for a Date. The Date must be between ${MIN_DATE_ISO} and ${MAX_DATE_ISO}`;
        }
    }
    return undefined;
}

function validateIntegerAttribute(attributeTag: string, attributeValue: AttributeType): string | undefined {
    if (typeof attributeValue === 'bigint' && (attributeValue < 0 || attributeValue > MAX_U64)) {
        return `The attribute [${attributeValue}] for key [${attributeTag}] is out of bounds for a u64 integer.`;
    }
    return undefined;
}

function validateStringAttribute(attributeTag: string, attributeValue: AttributeType): string | undefined {
    if (typeof attributeValue === 'string' && Buffer.from(attributeValue, 'utf-8').length > 31) {
        return `The attribute [${attributeValue}] for key [${attributeTag}] is greater than 31 bytes.`;
    }
    return undefined;
}

function validateAttributeBounds(
    attributeTag: string,
    attributeValue: AttributeType
): { error: false } | { error: true; message: string } {
    if (
        typeof attributeValue !== 'string' &&
        typeof attributeValue !== 'bigint' &&
        !isTimestampAttribute(attributeValue)
    ) {
        return { error: true, message: 'Unsupported attribute type' };
    }

    const stringError = validateStringAttribute(attributeTag, attributeValue);
    if (stringError) {
        return { error: true, message: stringError };
    }

    const integerError = validateIntegerAttribute(attributeTag, attributeValue);
    if (integerError) {
        return { error: true, message: integerError };
    }

    const timestampError = validateTimestampAttribute(attributeTag, attributeValue);
    if (timestampError) {
        return { error: true, message: timestampError };
    }

    return { error: false };
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

        for (const [attributeKey, attributeValue] of Object.entries(credential.credentialSubject.attributes)) {
            const validationResult = validateAttributeBounds(attributeKey, attributeValue);
            if (validationResult.error) {
                return rejectRequest(validationResult.message);
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
    if (!isHex(msg.payload.challenge) || msg.payload.challenge.length !== 64) {
        return rejectRequest(`Challenge is invalid, it should be 32 bytes as a HEX encoded string`);
    }
    try {
        const statements: CredentialStatements = parse(msg.payload.statements);

        // The `verifyAtomicStatements` method only verifies the bounds of the statement variables when it has the
        // schema available. So we manually do this check here, even though it ideally be moved to the SDK.
        for (const stat of statements) {
            for (const atomicStatement of stat.statement) {
                if (atomicStatement.type === StatementTypes.AttributeInRange) {
                    const lowerValidationResult = validateAttributeBounds(
                        atomicStatement.attributeTag,
                        atomicStatement.lower
                    );
                    if (lowerValidationResult.error) {
                        return rejectRequest(lowerValidationResult.message);
                    }

                    const upperValidationResult = validateAttributeBounds(
                        atomicStatement.attributeTag,
                        atomicStatement.upper
                    );
                    if (upperValidationResult.error) {
                        return rejectRequest(upperValidationResult.message);
                    }
                }

                if (
                    StatementTypes.AttributeInSet === atomicStatement.type ||
                    StatementTypes.AttributeNotInSet === atomicStatement.type
                ) {
                    for (const setItem of atomicStatement.set) {
                        const validationResult = validateAttributeBounds(atomicStatement.attributeTag, setItem);
                        if (validationResult.error) {
                            return rejectRequest(validationResult.message);
                        }
                    }
                }
            }
        }

        // If a statement does not verify, an error is thrown.
        statements.every((credStatement) =>
            isAccountCredentialStatement(credStatement)
                ? verifyAtomicStatements(credStatement.statement, IDENTITY_SUBJECT_SCHEMA) &&
                  verifyIdstatement(credStatement.statement as IdStatement)
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

/**
 * Check if the web3IdProof payload statements are an "Age proof"
 * i.e. it is a single account credential statement with a single atomic statement, which is an age statement.
 * n.b. We have this to filter some request to a special page for age statements.
 */
export function isAgeProof(payload: { statements: string }): boolean {
    try {
        const statements: CredentialStatements = parse(payload.statements);
        const credentialStatement = statements[0];

        if (!(statements.length === 1 && isAccountCredentialStatement(credentialStatement))) {
            return false;
        }

        const atomicStatement = credentialStatement.statement[0];

        return (
            credentialStatement.statement.length === 1 &&
            atomicStatement.type === StatementTypes.AttributeInRange &&
            atomicStatement.attributeTag === AttributeKeyString.dob &&
            isAgeStatement(atomicStatement as SecretStatement)
        );
    } catch (e) {
        logError(e);
        return false;
    }
}
