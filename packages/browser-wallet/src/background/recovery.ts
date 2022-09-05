import {
    createIdentityRecoveryRequest,
    CryptographicParameters,
    IdentityObjectV1,
    IdentityRecoveryRequestInput,
    Network,
    Versioned,
} from '@concordium/web-sdk';
import { ExtensionMessageHandler } from '@concordium/browser-wallet-message-hub';
import { IdentityProviderIdentityStatus, IdentityTokenContainer, sleep } from 'wallet-common-helpers';
import { Identity, CreationStatus, IdentityProvider } from '@shared/storage/types';
import { BackgroundResponseStatus } from '@shared/utils/types';
import { addIdentity } from './update';

// TODO: increase max empty
// How many empty identityIndices are allowed before stopping
const maxEmpty = 3;
// Milliseconds to wait, if retrievalUrl is still pending
const sleepInterval = 5000;

export type Payload = {
    providers: IdentityProvider[];
    globalContext: CryptographicParameters;
    seedAsHex: string;
    net: Network;
};

/**
 * Polls the provided location until a valid identity object is available, or that an error is returned.
 * If an error is returned from the url, this return undefined.
 * If the identity provider is not reachable, the promise will reject.
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
    let nextId = 0;
    const identitiesToAdd: Identity[] = [];

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
            const recoverResponse = await (await fetch(recoverUrl)).json();
            if (recoverResponse.identityRetrievalUrl) {
                const idObject = await getIdentityObject(recoverResponse.identityRetrievalUrl);
                if (idObject) {
                    identitiesToAdd.push({
                        name: `Identity ${nextId + 1}`,
                        index: identityIndex,
                        providerIndex: provider.ipInfo.ipIdentity,
                        status: CreationStatus.Confirmed,
                        idObject,
                    });
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
}

export const recoveryHandler: ExtensionMessageHandler = (msg, _sender, respond) => {
    performRecovery(msg.payload)
        .then(() => respond(BackgroundResponseStatus.Success))
        .catch(() => respond(BackgroundResponseStatus.Error));
    return true;
};
