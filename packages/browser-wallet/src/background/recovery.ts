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
import { ExtensionMessageHandler, InternalMessageType } from '@concordium/browser-wallet-message-hub';
import { BackgroundResponseStatus, RecoveryBackgroundResponse } from '@shared/utils/types';
import { Identity, CreationStatus, IdentityProvider, WalletCredential } from '@shared/storage/types';
import { sessionIsRecovering, storedCredentials, storedCurrentNetwork, storedIdentities } from '@shared/storage/access';
import { identityMatch, isIdentityOfCredential } from '@shared/utils/identity-helpers';
import { getNextEmptyCredNumber } from '@popup/shared/utils/account-helpers';
import { addCredential, addIdentity } from './update';
import bgMessageHandler from './message-handler';
import { openWindow } from './window-management';

// How many empty identityIndices are allowed before stopping
const maxEmpty = 20;

async function recoverAccounts(
    identityIndex: number,
    providerIndex: number,
    credentialInput: Omit<CredentialInputV1, 'credNumber'>,
    getAccountInfo: (credId: string) => Promise<AccountInfo | undefined>,
    existingCredentialsOfIdentity: WalletCredential[]
): Promise<WalletCredential[]> {
    const credsToAdd: WalletCredential[] = [];

    let emptyIndices = 0;
    let credNumber = getNextEmptyCredNumber(existingCredentialsOfIdentity);
    while (emptyIndices < maxEmpty) {
        // eslint-disable-next-line @typescript-eslint/no-loop-func
        if (!existingCredentialsOfIdentity.some((cred) => cred.credNumber === credNumber)) {
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
                emptyIndices = 0;
            } else {
                emptyIndices += 1;
            }
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
    try {
        const identitiesToAdd: Identity[] = [];
        const credsToAdd: WalletCredential[] = [];
        let nextId = 0;

        const network = await storedCurrentNetwork.get();
        if (!network) {
            throw new Error('No chosen network could be found');
        }
        const identities = await storedIdentities.get(network.genesisHash);
        const credentials = await storedCredentials.get(network.genesisHash);

        const client = new JsonRpcClient(new HttpProvider(network.jsonRpcUrl, fetch));
        const blockHash = (await client.getConsensusStatus()).lastFinalizedBlock;
        const getAccountInfo = (credId: string) =>
            client.getAccountInfo(new CredentialRegistrationId(credId), blockHash);

        for (const provider of providers) {
            // TODO: Is required because some identity providers do not have a recoveryStart value. This is an error and should be fixed in the wallet proxy. At that point this can be safely removed.
            if (!provider.metadata.recoveryStart) {
                // eslint-disable-next-line no-continue
                continue;
            }
            const providerIndex = provider.ipInfo.ipIdentity;
            let emptyIndices = 0;
            let identityIndex = 0;
            while (emptyIndices < maxEmpty) {
                // Check if there is already an identity on the current index
                let identity = identities?.find(identityMatch({ index: identityIndex, providerIndex }));
                if (!identity) {
                    // Attempt to recover the identity
                    const recoverUrl = getRecoverUrl({ ...recoveryInputs, identityIndex }, provider);
                    const response = await fetch(recoverUrl);
                    if (response.ok) {
                        const idObject = await response.json();
                        identity = {
                            name: `Identity ${nextId + 1}`,
                            index: identityIndex,
                            providerIndex,
                            status: CreationStatus.Confirmed,
                            idObject,
                        };
                        identitiesToAdd.push(identity);
                    }
                }
                if (identity) {
                    // Only recover accounts, if we found an identity
                    if (identity.status === CreationStatus.Confirmed) {
                        credsToAdd.push(
                            ...(await recoverAccounts(
                                identityIndex,
                                providerIndex,
                                {
                                    identityIndex,
                                    ipInfo: provider.ipInfo,
                                    arsInfos: provider.arsInfos,
                                    globalContext: recoveryInputs.globalContext,
                                    seedAsHex: recoveryInputs.seedAsHex,
                                    net: recoveryInputs.net,
                                    expiry: Date.now(),
                                    revealedAttributes: [],
                                    idObject: identity.idObject.value,
                                },
                                getAccountInfo,
                                (credentials || []).filter(isIdentityOfCredential(identity))
                            ))
                        );
                    }
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
        return {
            identities: identitiesToAdd.map((id) => ({ index: id.index, providerIndex: id.providerIndex })),
            accounts: credsToAdd.map((cred) => cred.address),
        };
    } finally {
        await sessionIsRecovering.set(false);
    }
}

export const recoveryHandler: ExtensionMessageHandler = (msg) => {
    const respond = async (result: RecoveryBackgroundResponse) => {
        await openWindow();
        bgMessageHandler.sendInternalMessage(InternalMessageType.RecoveryFinished, result);
    };
    performRecovery(msg.payload)
        .then((added) => respond({ status: BackgroundResponseStatus.Success, added }))
        .catch((e) => respond({ status: BackgroundResponseStatus.Error, reason: e.toString() }));
};
