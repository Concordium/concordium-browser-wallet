import {
    createIdentityRecoveryRequest,
    CryptographicParameters,
    IdentityObjectV1,
    IdentityRecoveryRequestInput,
    Network as NetworkString,
    Versioned,
} from '@concordium/web-sdk';
import { ExtensionMessageHandler } from '@concordium/browser-wallet-message-hub';
import { IdentityProviderIdentityStatus, IdentityTokenContainer, sleep } from 'wallet-common-helpers';
import { Identity, CreationStatus, Network as NetworkValue, IdentityProvider } from '@shared/storage/types';
import { BackgroundResponseStatus } from '@shared/utils/types';
import { addIdentity } from './update';

// How many empty identityIndices are allowed before stopping
const maxEmpty = 3;
// Milliseconds to wait, if retrievelUrl is still pending
const sleepInterval = 5000;

// TODO: use dependency for this (https://en.wikipedia.org/wiki/Fisher%E2%80%93Yates_shuffle)
/**
 * Shuffles the given array in place. (modifying the original reference)
 */
function shuffle<T>(array: T[]): T[] {
    for (let i = array.length - 1; i > 0; i -= 1) {
        const j = Math.floor(Math.random() * (i + 1)); // random index from 0 to i
        // eslint-disable-next-line no-param-reassign
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
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
    let emptyIndices = 0;
    let identityIndex = 0;
    const network = NetworkValue[recoveryInputs.net];
    const identitiesToAdd: Identity[] = [];

    while (emptyIndices < maxEmpty) {
        let found = false;
        for (const provider of shuffle(providers)) {
            const recoverUrl = getRecoverUrl({ ...recoveryInputs, identityIndex }, provider);
            const recoverResponse = await (await fetch(recoverUrl)).json();
            if (recoverResponse.identityRetrievalUrl) {
                const idObject = await getIdentityObject(recoverResponse.identityRetrievalUrl);
                if (idObject) {
                    identitiesToAdd.push({
                        id: nextId,
                        name: `identity ${nextId + 1}`,
                        index: identityIndex,
                        network,
                        provider: provider.ipInfo.ipIdentity,
                        status: CreationStatus.Confirmed,
                        idObject,
                    });
                    nextId += 1;
                    found = true;
                    break;
                }
            }
        }
        if (!found) {
            emptyIndices += 1;
        }
        identityIndex += 1;
    }
    await addIdentity(identitiesToAdd);
}

export const recoveryHandler: ExtensionMessageHandler = (msg, _sender, respond) => {
    performRecovery(msg.payload)
        .then(() => respond(BackgroundResponseStatus.Success))
        .catch(() => respond(BackgroundResponseStatus.Error));
    return true;
};
