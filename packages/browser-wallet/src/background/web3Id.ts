import { createConcordiumClient, verifyWeb3IdCredentialSignature } from '@concordium/web-sdk';
import {
    sessionVerifiableCredentials,
    storedCurrentNetwork,
    storedVerifiableCredentials,
    useIndexedStorage,
} from '@shared/storage/access';

import { CredentialProof } from '@concordium/browser-wallet-api-helpers';
import { GRPCTIMEOUT } from '@shared/constants/networkConfiguration';
import { VerifiableCredential } from '@shared/storage/types';
import { addToList, web3IdCredentialLock } from '@shared/storage/update';
import {
    getCredentialRegistryContractAddress,
    getCredentialRegistryIssuerKey,
    getPublicKeyfromPublicKeyIdentifierDID,
} from '@shared/utils/verifiable-credential-helpers';

const NO_CREDENTIALS_FIT = 'No temporary credentials fit the given id';
const INVALID_CREDENTIAL_PROOF = 'Invalid credential proof given';

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

    if (
        !proof?.proofValue ||
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

    addToList(
        web3IdCredentialLock,
        credential,
        useIndexedStorage(storedVerifiableCredentials, () => Promise.resolve(genesisHash))
    );
    // TODO remove temp in session
}
