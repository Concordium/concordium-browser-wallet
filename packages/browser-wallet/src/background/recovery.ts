import {
    AccountInfo,
    createCredentialV1,
    createIdentityRecoveryRequest,
    CredentialInputV1,
    CredentialRegistrationId,
    CryptographicParameters,
    HttpProvider,
    IdentityRecoveryRequestInput,
    JsonRpcClient,
    Network,
} from '@concordium/web-sdk';
import { ExtensionMessageHandler } from '@concordium/browser-wallet-message-hub';
import { BackgroundResponseStatus } from '@shared/utils/types';
import { Identity, CreationStatus, IdentityProvider, WalletCredential } from '@shared/storage/types';
import { storedCurrentNetwork } from '@shared/storage/access';
import { addCredential, addIdentity } from './update';

// How many empty identityIndices are allowed before stopping
const maxEmpty = 10;

async function recoverAccounts(
    identityIndex: number,
    providerIndex: number,
    credentialInput: Omit<CredentialInputV1, 'credNumber'>,
    getAccountInfo: (credId: string) => Promise<AccountInfo | undefined>
): Promise<WalletCredential[]> {
    const credsToAdd: WalletCredential[] = [];

    let emptyIndices = 0;
    let credNumber = 0;
    while (emptyIndices < maxEmpty) {
        const request = createCredentialV1({ ...credentialInput, credNumber });
        const { credId } = request.cdi;
        const accountInfo = await getAccountInfo(credId);
        if (accountInfo) {
            credsToAdd.push({
                address: accountInfo.accountAddress,
                credId,
                credNumber,
                status: CreationStatus.Confirmed,
                identityIndex,
                providerIndex,
            });
        } else {
            emptyIndices += 1;
        }
        credNumber += 1;
    }
    return credsToAdd;
}

export type Payload = {
    providers: IdentityProvider[];
    globalContext: CryptographicParameters;
    seedAsHex: string;
    net: Network;
};

function getRecoverUrl(inputs: Omit<IdentityRecoveryRequestInput, 'timestamp' | 'ipInfo'>, provider: IdentityProvider) {
    const timestamp = Math.floor(Date.now() / 1000);
    const idRecoveryRequest = createIdentityRecoveryRequest({ ...inputs, timestamp, ipInfo: provider.ipInfo });

    const searchParams = new URLSearchParams({
        state: JSON.stringify({ idRecoveryRequest }),
    });
    return `${provider.metadata.recoveryStart}?${searchParams.toString()}`;
}

async function performRecovery({ providers, ...recoveryInputs }: Payload) {
    let nextId = 0;
    const identitiesToAdd: Identity[] = [];
    const credsToAdd: WalletCredential[] = [];

    const network = await storedCurrentNetwork.get();
    if (!network) {
        throw new Error('No chosen network could be found');
    }
    const client = new JsonRpcClient(new HttpProvider(network.jsonRpcUrl, fetch));
    const blockHash = (await client.getConsensusStatus()).lastFinalizedBlock;
    const getAccountInfo = (credId: string) => client.getAccountInfo(new CredentialRegistrationId(credId), blockHash);

    for (const provider of providers) {
        // TODO: Is required because some identity providers do not have a recoveryStart value. This is an error and should be fixed in the wallet proxy. At that point this can be safely removed.
        if (!provider.metadata.recoveryStart) {
            // eslint-disable-next-line no-continue
            continue;
        }
        let emptyIndices = 0;
        let identityIndex = 0;
        while (emptyIndices < maxEmpty) {
            const recoverUrl = getRecoverUrl({ ...recoveryInputs, identityIndex }, provider);
            const response = await fetch(recoverUrl);
            if (response.ok) {
                const idObject = await response.json();
                identitiesToAdd.push({
                    name: `Identity ${nextId + 1}`,
                    index: identityIndex,
                    providerIndex: provider.ipInfo.ipIdentity,
                    status: CreationStatus.Confirmed,
                    idObject,
                });
                credsToAdd.push(
                    ...(await recoverAccounts(
                        identityIndex,
                        provider.ipInfo.ipIdentity,
                        {
                            identityIndex,
                            ipInfo: provider.ipInfo,
                            arsInfos: provider.arsInfos,
                            globalContext: recoveryInputs.globalContext,
                            seedAsHex: recoveryInputs.seedAsHex,
                            net: recoveryInputs.net,
                            expiry: Date.now(),
                            revealedAttributes: [],
                            idObject: idObject.value,
                        },
                        getAccountInfo
                    ))
                );
                nextId += 1;
                emptyIndices = 0;
            } else {
                emptyIndices += 1;
            }
            identityIndex += 1;
        }
    }
    await addIdentity(identitiesToAdd);
    await addCredential(credsToAdd);
}

export const recoveryHandler: ExtensionMessageHandler = (msg, _sender, respond) => {
    performRecovery(msg.payload)
        .then(() => respond({ status: BackgroundResponseStatus.Success }))
        .catch((e) => respond({ status: BackgroundResponseStatus.Error, reason: e.toString() }));
    return true;
};
