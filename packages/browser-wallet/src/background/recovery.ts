import {
    AccountInfo,
    createCredentialV1,
    createIdentityRecoveryRequest,
    CredentialInputV1,
    CredentialRegistrationId,
    HttpProvider,
    IdentityRecoveryRequestInput,
    JsonRpcClient,
} from '@concordium/web-sdk';
import { InternalMessageType } from '@concordium/browser-wallet-message-hub';
import { BackgroundResponseStatus, RecoveryBackgroundResponse } from '@shared/utils/types';
import { Identity, CreationStatus, IdentityProvider, WalletCredential, RecoveryStatus } from '@shared/storage/types';
import {
    sessionIsRecovering,
    sessionRecoveryStatus,
    storedCredentials,
    storedCurrentNetwork,
    storedIdentities,
} from '@shared/storage/access';
import { identityMatch, isIdentityOfCredential } from '@shared/utils/identity-helpers';
import { getNextUnused } from '@shared/utils/number-helpers';
import { addCredential, addIdentity } from './update';
import bgMessageHandler from './message-handler';
import { openWindow } from './window-management';

// How many empty identityIndices are allowed before stopping
const maxEmpty = 20;

async function recoverAccounts(
    status: RecoveryStatus,
    providerIndex: number,
    credentialInput: Omit<CredentialInputV1, 'credNumber'>,
    getAccountInfo: (credId: string) => Promise<AccountInfo | undefined>,
    usedCredNumbersOfIdentity: number[]
): Promise<WalletCredential[]> {
    const credsToAdd: WalletCredential[] = [];

    let emptyIndices = status.credentialGap || 0;
    let credNumber = status.credentialNumber || getNextUnused(usedCredNumbersOfIdentity);
    while (emptyIndices < maxEmpty) {
        if (!usedCredNumbersOfIdentity.includes(credNumber)) {
            const request = createCredentialV1({ ...credentialInput, credNumber });
            const { credId } = request.cdi;
            const accountInfo = await getAccountInfo(credId);
            if (accountInfo) {
                credsToAdd.push({
                    address: accountInfo.accountAddress,
                    credId,
                    credNumber,
                    status: CreationStatus.Confirmed,
                    identityIndex: status.identityIndex || 0,
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

function getRecoverUrl(inputs: Omit<IdentityRecoveryRequestInput, 'timestamp' | 'ipInfo'>, provider: IdentityProvider) {
    const timestamp = Math.floor(Date.now() / 1000);
    const idRecoveryRequest = createIdentityRecoveryRequest({ ...inputs, timestamp, ipInfo: provider.ipInfo });

    const searchParams = new URLSearchParams({
        state: JSON.stringify({ idRecoveryRequest }),
    });
    return `${provider.metadata.recoveryStart}?${searchParams.toString()}`;
}

async function performRecovery() {
    try {
        const status = await sessionRecoveryStatus.get();
        if (!status) {
            throw new Error('Recovery was started without a status object.');
        }
        const { providers, ...recoveryInputs } = status.payload;

        const identitiesToAdd: Identity[] = status.identitiesToAdd || [];
        const credsToAdd: WalletCredential[] = status.credentialsToAdd || [];
        const completedProviders = status.completedProviders || [];
        let nextId = status?.nextId || 0;

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
            const providerIndex = provider.ipInfo.ipIdentity;
            if (completedProviders.includes(providerIndex)) {
                // eslint-disable-next-line no-continue
                continue;
            }
            // TODO: Is required because some identity providers do not have a recoveryStart value. This is an error and should be fixed in the wallet proxy. At that point this can be safely removed.
            if (!provider.metadata.recoveryStart) {
                // eslint-disable-next-line no-continue
                continue;
            }
            let emptyIndices = status.identityGap || 0;
            let identityIndex = status.identityIndex || 0;
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
                        status.identitiesToAdd = identitiesToAdd;
                        await sessionRecoveryStatus.set(status);
                    }
                }
                if (identity) {
                    // Only recover accounts, if we found an identity
                    if (identity.status === CreationStatus.Confirmed) {
                        const foundCreds = await recoverAccounts(
                            status,
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
                            credsToAdd
                                .concat(credentials || [])
                                .filter(isIdentityOfCredential(identity))
                                .map((cred) => cred.credNumber)
                        );
                        credsToAdd.push(...foundCreds);
                    }
                    nextId += 1;
                    emptyIndices = 0;
                } else {
                    emptyIndices += 1;
                }
                identityIndex += 1;
                completedProviders.push(providerIndex);
                await sessionRecoveryStatus.set({
                    payload: status.payload,
                    identityIndex,
                    identityGap: emptyIndices,
                    identitiesToAdd,
                    credentialsToAdd: credsToAdd,
                    completedProviders,
                    nextId,
                });
            }
        }
        await addIdentity(identitiesToAdd, network.genesisHash);
        await addCredential(credsToAdd, network.genesisHash);
        return {
            identities: identitiesToAdd.map((id) => ({ index: id.index, providerIndex: id.providerIndex })),
            accounts: credsToAdd.map((cred) => cred.address),
        };
    } finally {
        await sessionIsRecovering.set(false);
    }
}

export async function startRecovery() {
    const isRecovering = await sessionIsRecovering.get();
    if (isRecovering) {
        const respond = async (result: RecoveryBackgroundResponse) => {
            await openWindow();
            bgMessageHandler.sendInternalMessage(InternalMessageType.RecoveryFinished, result);
        };
        performRecovery()
            .then((added) => respond({ status: BackgroundResponseStatus.Success, added }))
            .catch((e) => respond({ status: BackgroundResponseStatus.Error, reason: e.toString() }));
    }
}
