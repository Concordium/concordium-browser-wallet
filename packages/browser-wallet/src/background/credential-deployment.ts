import { ExtensionMessageHandler } from '@concordium/browser-wallet-message-hub';

import {
    CredentialInput,
    getAccountAddress,
    createConcordiumClient,
    createCredentialTransaction,
    signCredentialTransaction,
    ConcordiumHdWallet,
    TransactionExpiry,
    getCredentialDeploymentTransactionHash,
} from '@concordium/web-sdk';
import { GRPCTIMEOUT } from '@shared/constants/networkConfiguration';
import { DEFAULT_TRANSACTION_EXPIRY } from '@shared/constants/time';
import { sessionCreatingCredential, storedCurrentNetwork, storedSelectedAccount } from '@shared/storage/access';
import { CreationStatus, PendingWalletCredential } from '@shared/storage/types';
import { BackgroundResponseStatus, CredentialDeploymentBackgroundResponse } from '@shared/utils/types';
import { confirmCredential } from './confirmation';
import { addCredential } from './update';

async function createAndSendCredential(credIn: CredentialInput): Promise<CredentialDeploymentBackgroundResponse> {
    let address: string;
    try {
        const network = await storedCurrentNetwork.get();
        if (!network) {
            throw new Error('No network available');
        }

        const { identityIndex, credNumber } = credIn;
        const providerIndex = credIn.ipInfo.ipIdentity;

        const expiry = new TransactionExpiry(new Date(Date.now() + DEFAULT_TRANSACTION_EXPIRY));
        const request = createCredentialTransaction(credIn, expiry);
        const signingKey = ConcordiumHdWallet.fromHex(credIn.seedAsHex, credIn.net)
            .getAccountSigningKey(providerIndex, identityIndex, credNumber)
            .toString('hex');
        const signature = await signCredentialTransaction(request, signingKey);
        const { credId } = request.unsignedCdi;
        const deploymentHash = getCredentialDeploymentTransactionHash(request, [signature]);
        address = getAccountAddress(credId).address;
        const newCred: PendingWalletCredential = {
            address,
            identityIndex,
            providerIndex,
            credId,
            credNumber,
            status: CreationStatus.Pending,
            deploymentHash,
        };

        // Send Request
        const successful = await createConcordiumClient(network.grpcUrl, network.grpcPort, {
            timeout: GRPCTIMEOUT,
        }).sendCredentialDeploymentTransaction(request, [signature]);
        if (!successful) {
            throw new Error('Credential deployment was rejected');
        }

        // Add Pending
        await addCredential(newCred, network.genesisHash);
        confirmCredential(newCred, network);
        // Set Selected to new account
        await storedSelectedAccount.set(address);
    } finally {
        // Remove guard stopping another credential being created
        await sessionCreatingCredential.set(false);
    }

    return {
        status: BackgroundResponseStatus.Success,
        address,
    };
}

export const sendCredentialHandler: ExtensionMessageHandler = (msg, _sender, respond) => {
    createAndSendCredential(msg.payload)
        .then(respond)
        .catch((e) => respond({ status: BackgroundResponseStatus.Error, error: e.toString() }));
    return true;
};
