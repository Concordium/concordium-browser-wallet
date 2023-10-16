import { ExtensionMessageHandler } from '@concordium/browser-wallet-message-hub';

import {
    CredentialInput,
    getAccountAddress,
    ConcordiumGRPCWebClient,
    createCredentialTransaction,
    signCredentialTransaction,
    ConcordiumHdWallet,
    TransactionExpiry,
    getCredentialDeploymentTransactionHash,
    CredentialRegistrationId,
    serializeCredentialDeploymentPayload,
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

        const expiry = TransactionExpiry.fromDate(new Date(Date.now() + DEFAULT_TRANSACTION_EXPIRY));
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

        const client = new ConcordiumGRPCWebClient(network.grpcUrl, network.grpcPort, {
            timeout: GRPCTIMEOUT,
        });

        // Check that the credential has not already been deployed:
        try {
            const accountInfo = await client.getAccountInfo(CredentialRegistrationId.fromHexString(credId));
            const existingAddress = accountInfo.accountAddress.address;
            await addCredential(
                {
                    identityIndex,
                    providerIndex,
                    credId,
                    credNumber,
                    address: existingAddress,
                    status: CreationStatus.Confirmed,
                },
                network.genesisHash
            );

            // Set Selected to new account
            await storedSelectedAccount.set(existingAddress);

            return {
                status: BackgroundResponseStatus.Aborted,
                address: existingAddress,
            };
        } catch {
            // If an error is thrown, we assume this is because the credential has not been deployed yet.
        }

        // Send Request
        const payload = serializeCredentialDeploymentPayload([signature], request);
        const successful = await client.sendCredentialDeploymentTransaction(payload, expiry);
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
