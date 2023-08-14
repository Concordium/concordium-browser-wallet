import { createConcordiumClient, verifyWeb3IdCredentialSignature } from '@concordium/web-sdk';
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
import { MessageStatusWrapper } from '@concordium/browser-wallet-message-hub';
import { getNet } from '@shared/utils/network-helpers';
import { RunCondition } from './window-management';

const NO_CREDENTIALS_FIT = 'No temporary credentials fit the given id';
const INVALID_CREDENTIAL_PROOF = 'Invalid credential proof given';
const MISSING_CREDENTIAL_PROOF = 'No credential proof given';

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

/**
 * Run condition which ensures that the web3IdCredential request is valid.
 */
export const runIfValidWeb3IdCredentialRequest: RunCondition<MessageStatusWrapper<undefined>> = async (msg) => {
    const { credential }: { credential: APIVerifiableCredential } = msg.payload;
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
            return {
                run: false,
                response: { success: false, message: `Credential does not have the correct type` },
            };
        }

        const credNetwork = getDIDNetwork(credential.issuer);
        if (net.toLowerCase() !== credNetwork) {
            return {
                run: false,
                response: {
                    success: false,
                    message: `Credential issuer network is not the same as the current wallet network`,
                },
            };
        }
        return { run: true };
    } catch (e) {
        return {
            run: false,
            response: { success: false, message: `Credential is not well-formed: ${(e as Error).message}` },
        };
    }
};
