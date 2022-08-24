import { ExtensionMessageHandler } from '@concordium/browser-wallet-message-hub';

import {
    HttpProvider,
    createCredentialV1,
    CredentialInputV1,
    getAccountAddress,
    getSignedCredentialDeploymentTransactionHash,
    JsonRpcClient,
} from '@concordium/web-sdk';
import { storedCurrentNetwork } from '@shared/storage/access';
import { CreationStatus, Network, PendingWalletCredential } from '@shared/storage/types';
import { BackgroundResponseStatus, CredentialDeploymentBackgroundResponse } from '@shared/utils/types';
import { addCredential } from './update';

interface Props extends CredentialInputV1 {
    identityId: number;
}

async function createAndSendCredential({
    identityId,
    ...credIn
}: Props): Promise<CredentialDeploymentBackgroundResponse> {
    const network = await storedCurrentNetwork.get();
    const url = network?.jsonRpcUrl;
    if (!url) {
        throw new Error('No JSON RPC url available');
    }
    const request = createCredentialV1(credIn);
    const { credId } = request.cdi;
    const deploymentHash = getSignedCredentialDeploymentTransactionHash(request);
    const { address } = getAccountAddress(credId);
    const newCred: PendingWalletCredential = {
        address,
        identityId,
        credId,
        credNumber: credIn.credNumber,
        status: CreationStatus.Pending,
        deploymentHash,
        net: Network[credIn.net as keyof typeof Network],
    };

    // Send Request
    const successful = await new JsonRpcClient(new HttpProvider(url, fetch)).sendCredentialDeployment(request);
    if (!successful) {
        throw new Error('Credential deployment was rejected');
    }

    // Add Pending
    await addCredential(newCred);

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
