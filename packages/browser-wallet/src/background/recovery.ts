import {
    AccountInfo,
    createCredentialV1,
    createIdentityRecoveryRequest,
    CredentialInputV1,
    CredentialRegistrationId,
    CryptographicParameters,
    getAccountAddress,
    HttpProvider,
    IdentityObjectV1,
    IdentityRecoveryRequestInput,
    JsonRpcClient,
    Network as NetworkString,
    Versioned,
} from '@concordium/web-sdk';
import { ExtensionMessageHandler } from '@concordium/browser-wallet-message-hub';
import { IdentityProviderIdentityStatus, IdentityTokenContainer, sleep } from 'wallet-common-helpers';
import { BackgroundResponseStatus } from '@shared/utils/types';
import { Identity, CreationStatus, IdentityProvider, WalletCredential } from '@shared/storage/types';
import { storedCurrentNetwork } from '@shared/storage/access';
import { addCredential, addIdentity } from './update';

// TODO: increase max empty
// How many empty identityIndices are allowed before stopping
const maxEmpty = 3;
// Milliseconds to wait, if retrievelUrl is still pending
const sleepInterval = 5000;

function getAddressFrom(accountInfo: AccountInfo) {
    const firstCredential = accountInfo.accountCredentials[0];
    const firstCredId =
        firstCredential.value.type === 'initial'
            ? firstCredential.value.contents.regId
            : firstCredential.value.contents.credId;
    return getAccountAddress(firstCredId);
}

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
                address: getAddressFrom(accountInfo).address,
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
    net: NetworkString;
};

/**
 * Polls the provided location until a valid identity object is available, or that an error is returned.
 * If an error occurs or is returned from the url, this return undefined
 */
async function getIdentityObject(url: string): Promise<Versioned<IdentityObjectV1> | undefined> {
    // eslint-disable-next-line no-constant-condition
    while (true) {
        const response = (await (await fetch(url)).json()) as IdentityTokenContainer;
        if (response.status === IdentityProviderIdentityStatus.Error) {
            return undefined;
        }
        if (response.status === IdentityProviderIdentityStatus.Done) {
            return response.token.identityObject;
        }
        await sleep(sleepInterval);
    }
}

function getRecoverUrl(inputs: Omit<IdentityRecoveryRequestInput, 'timestamp' | 'ipInfo'>, provider: IdentityProvider) {
    const timestamp = Math.floor(Date.now() / 1000);
    const idRecoveryRequest = createIdentityRecoveryRequest({ ...inputs, timestamp, ipInfo: provider.ipInfo });

    const searchParams = new URLSearchParams({
        state: JSON.stringify({ idRecoveryRequest }),
    });
    return `${provider.metadata.recoveryStart}?${searchParams.toString()}`;
}

async function performRecovery({ providers, ...recoveryInputs }: Payload) {
    // const identities = await storedIdentities.get();
    // let nextId = identities ? identities.length + 1 : 0;
    let nextId = 0;
    const identitiesToAdd: Identity[] = [];
    const credsToAdd: WalletCredential[] = [];

    const network = await storedCurrentNetwork.get();
    if (!network) {
        return;
    }
    const client = new JsonRpcClient(new HttpProvider(network.jsonRpcUrl, fetch));
    const blockHash = (await client.getConsensusStatus()).lastFinalizedBlock;
    const getAccountInfo = (credId: string) => client.getAccountInfo(new CredentialRegistrationId(credId), blockHash);

    for (const provider of providers) {
        // TODO: remove this when providers have been fixed
        if (!provider.metadata.recoveryStart) {
            // eslint-disable-next-line no-continue
            continue;
        }
        let emptyIndices = 0;
        let identityIndex = 0;
        while (emptyIndices < maxEmpty) {
            const recoverUrl = getRecoverUrl({ ...recoveryInputs, identityIndex }, provider);
            const recoverResponse = await (await fetch(recoverUrl)).json();
            if (recoverResponse.identityRetrievalUrl) {
                const idObject = await getIdentityObject(recoverResponse.identityRetrievalUrl);
                if (idObject) {
                    identitiesToAdd.push({
                        name: `identity ${nextId + 1}`,
                        index: identityIndex,
                        provider: provider.ipInfo.ipIdentity,
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
                    identityIndex += 1;
                    emptyIndices = 0;
                    // eslint-disable-next-line no-continue
                    continue;
                }
            }
            emptyIndices += 1;
            identityIndex += 1;
        }
    }
    await addIdentity(identitiesToAdd);
    await addCredential(credsToAdd);
}

export const recoveryHandler: ExtensionMessageHandler = (msg, _sender, respond) => {
    performRecovery(msg.payload)
        .then(() => respond(BackgroundResponseStatus.Success))
        .catch(() => respond(BackgroundResponseStatus.Error));
    return true;
};
