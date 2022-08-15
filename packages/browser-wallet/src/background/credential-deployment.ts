import { ExtensionMessageHandler } from '@concordium/browser-wallet-message-hub';

import {
    HttpProvider,
    createCredentialV1,
    CredentialInputV1,
    getAccountAddress,
    getSignedCredentialDeploymentTransactionHash,
    JsonRpcClient,
} from '@concordium/web-sdk';
import { storedJsonRpcUrl } from '@shared/storage/access';
import { IdentityStatus, Network, PendingWalletCredential } from '@shared/storage/types';
import { addCredential } from './update';

interface Props extends CredentialInputV1 {
    identityId: number;
}

async function createAndSendCredential({ identityId, ...credIn }: Props): Promise<string | undefined> {
    const url = await storedJsonRpcUrl.get();
    if (!url) {
        return 'No URL';
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
        status: IdentityStatus.Pending,
        deploymentHash,
        net: Network[credIn.net as keyof typeof Network],
    };

    // Add Pending
    await addCredential(newCred);

    // Send Request
    const successful = await new JsonRpcClient(new HttpProvider(url, fetch)).sendCredentialDeployment(request);
    if (!successful) {
        return 'Not succesful';
    }

    return address;
}

export const sendCredentialHandler: ExtensionMessageHandler = (msg, _sender, response) => {
    createAndSendCredential(msg.payload).then(response);
    return true;
};
