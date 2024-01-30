import {
    AccountInfo,
    ConcordiumHdWallet,
    createIdentityRecoveryRequest,
    CredentialRegistrationId,
    IdentityRecoveryRequestInput,
    ConcordiumGRPCWebClient,
} from '@concordium/web-sdk';
import { InternalMessageType } from '@concordium/browser-wallet-message-hub';
import { BackgroundResponseStatus, RecoveryBackgroundResponse } from '@shared/utils/types';
import {
    Identity,
    CreationStatus,
    IdentityProvider,
    RecoveryStatus,
    CredentialBalancePair,
    ConfirmedIdentity,
} from '@shared/storage/types';
import {
    sessionIsRecovering,
    sessionRecoveryStatus,
    sessionPasscode,
    storedCredentials,
    storedCurrentNetwork,
    storedIdentities,
    storedEncryptedSeedPhrase,
} from '@shared/storage/access';
import { identityMatch, isIdentityOfCredential } from '@shared/utils/identity-helpers';
import { getNextUnused } from '@shared/utils/number-helpers';
import { partition } from 'wallet-common-helpers';
import { mnemonicToSeedSync } from '@scure/bip39';
import { decrypt } from '@shared/utils/crypto';
import { Buffer } from 'buffer/';
import { GRPCTIMEOUT } from '@shared/constants/networkConfiguration';
import { addCredential, addIdentity, updateCredentials, updateIdentities } from './update';
import bgMessageHandler, { onMessage } from './message-handler';
import { openWindow } from './window-management';

// How many empty identityIndices are allowed before stopping
const maxEmpty = 20;
const RECOVERY_ALARM_NAME = 'recoveryAlarm';
const RECOVERY_LOCK = 'concordium_recovery_lock';

async function recoverAccounts(
    status: RecoveryStatus,
    providerIndex: number,
    getCredId: (credNumber: number) => string,
    getAccountInfo: (credId: string) => Promise<AccountInfo | undefined>,
    usedCredNumbersOfIdentity: number[]
): Promise<CredentialBalancePair[]> {
    const credsToAdd: CredentialBalancePair[] = [];

    let emptyIndices = status.credentialGap || 0;
    let credNumber = status.credentialNumber || getNextUnused(usedCredNumbersOfIdentity);
    const identityIndex = status.identityIndex || 0;

    while (emptyIndices < maxEmpty) {
        if (!usedCredNumbersOfIdentity.includes(credNumber)) {
            const credId = getCredId(credNumber);
            const accountInfo = await getAccountInfo(credId);
            if (accountInfo) {
                credsToAdd.push({
                    cred: {
                        address: accountInfo.accountAddress.address,
                        credId,
                        credNumber,
                        status: CreationStatus.Confirmed,
                        identityIndex,
                        providerIndex,
                    },
                    balance: accountInfo.accountAmount.toJSON(),
                });
                emptyIndices = 0;
            } else {
                emptyIndices += 1;
            }
        }
        credNumber += 1;
        await sessionRecoveryStatus.set({
            ...status,
            credentialNumber: credNumber,
            credentialGap: emptyIndices,
            credentialsToAdd: (status.credentialsToAdd || []).concat(credsToAdd),
        });
    }
    return credsToAdd;
}

type RecoveryInputs = Omit<IdentityRecoveryRequestInput, 'timestamp' | 'ipInfo'>;

function getRecoverUrl(inputs: RecoveryInputs, provider: IdentityProvider) {
    const timestamp = Math.floor(Date.now() / 1000);
    const idRecoveryRequest = createIdentityRecoveryRequest({ ...inputs, timestamp, ipInfo: provider.ipInfo });

    const searchParams = new URLSearchParams({
        state: JSON.stringify({ idRecoveryRequest }),
    });
    return `${provider.metadata.recoveryStart}?${searchParams.toString()}`;
}

async function getSeed() {
    const passcode = await sessionPasscode.get();
    const encryptedSeed = await storedEncryptedSeedPhrase.get();
    if (!passcode || !encryptedSeed) {
        return undefined;
    }
    return Buffer.from(mnemonicToSeedSync(await decrypt(encryptedSeed, passcode))).toString('hex');
}

async function performRecovery(respond: (i: RecoveryBackgroundResponse) => void) {
    try {
        let status = await sessionRecoveryStatus.get();
        if (!status) {
            throw new Error('Recovery was started without a status object.');
        }
        const { providers, globalContext, net } = status.payload;
        const seedAsHex = await getSeed();
        if (!seedAsHex) {
            throw new Error('Unable to access secret seed.');
        }
        const hdWallet = ConcordiumHdWallet.fromHex(seedAsHex, net);
        const recoveryInputs: Omit<RecoveryInputs, 'identityIndex'> = { globalContext, net, seedAsHex };

        const identitiesToAdd: Identity[] = status.identitiesToAdd || [];
        const identitiesToUpdate: Identity[] = status.identitiesToUpdate || [];
        const credsToAdd: CredentialBalancePair[] = status.credentialsToAdd || [];
        const completedProviders = status.completedProviders || [];

        const network = await storedCurrentNetwork.get();
        if (!network) {
            throw new Error('No chosen network could be found');
        }
        const identities = await storedIdentities.get(network.genesisHash);
        const credentials = await storedCredentials.get(network.genesisHash);
        // Either use the saved nextId, otherwise start from after the existing identities
        let nextId = status?.nextId || identities?.length || 0;

        const client = new ConcordiumGRPCWebClient(network.grpcUrl, network.grpcPort, { timeout: GRPCTIMEOUT });
        const getAccountInfo = (credId: string) =>
            client.getAccountInfo(CredentialRegistrationId.fromHexString(credId)).catch(() => {
                return undefined;
            });

        let initialGap: number | undefined = status.identityGap || 0;
        let initialIndex: number | undefined = status.identityIndex || 0;

        const aborted = new AbortController();
        onMessage(InternalMessageType.AbortRecovery).then(() => aborted.abort());

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
            let emptyIndices = initialGap || 0;
            initialGap = undefined;
            let identityIndex = initialIndex || 0;
            initialIndex = undefined;
            while (emptyIndices < maxEmpty) {
                if (aborted.signal.aborted) {
                    return;
                }
                // Check if there is already an identity on the current index
                let identity = identities?.find(identityMatch({ index: identityIndex, providerIndex }));
                if (!identity || identity.status === CreationStatus.Rejected) {
                    // Attempt to recover the identity
                    const recoverUrl = getRecoverUrl({ ...recoveryInputs, identityIndex }, provider);
                    const response = await fetch(recoverUrl);
                    if (response.ok) {
                        const idObject = await response.json();
                        const newIdentity: ConfirmedIdentity = {
                            name: identity?.name || `Identity ${nextId + 1}`,
                            index: identityIndex,
                            providerIndex,
                            status: CreationStatus.Confirmed,
                            idObject,
                        };
                        if (identity) {
                            // There is rejected identity on this index
                            identitiesToUpdate.push(newIdentity);
                            status.identitiesToUpdate = identitiesToUpdate;
                        } else {
                            identitiesToAdd.push(newIdentity);
                            status.identitiesToAdd = identitiesToAdd;
                            nextId += 1;
                        }
                        identity = newIdentity;
                        await sessionRecoveryStatus.set(status);
                    }
                }
                if (identity) {
                    // Only recover accounts, if we found an identity
                    if (identity.status === CreationStatus.Confirmed) {
                        const foundCreds = await recoverAccounts(
                            status,
                            providerIndex,
                            // eslint-disable-next-line @typescript-eslint/no-loop-func
                            (credNumber) =>
                                hdWallet
                                    .getCredentialId(
                                        providerIndex,
                                        identityIndex,
                                        credNumber,
                                        recoveryInputs.globalContext
                                    )
                                    .toString('hex'),
                            getAccountInfo,
                            credsToAdd
                                .map((pair) => pair.cred)
                                .concat(credentials?.filter((c) => c.status !== CreationStatus.Rejected) || [])
                                .filter(isIdentityOfCredential(identity))
                                .map((cred) => cred.credNumber)
                        );

                        credsToAdd.push(...foundCreds);
                    }
                    emptyIndices = 0;
                } else {
                    emptyIndices += 1;
                }
                identityIndex += 1;
                status = {
                    payload: status.payload,
                    identitiesToAdd,
                    credentialsToAdd: credsToAdd,
                    completedProviders,
                    nextId,
                    identityIndex,
                    identityGap: emptyIndices,
                };
                await sessionRecoveryStatus.set(status);
            }
            completedProviders.push(providerIndex);
            status = {
                payload: status.payload,
                identitiesToAdd,
                credentialsToAdd: credsToAdd,
                completedProviders,
                nextId,
            };
            await sessionRecoveryStatus.set(status);
        }
        if (identitiesToAdd.length) {
            await addIdentity(identitiesToAdd, network.genesisHash);
        }
        if (identitiesToUpdate.length) {
            await updateIdentities(identitiesToUpdate, network.genesisHash);
        }
        const [updates, newCreds] = partition(
            credsToAdd.map((pair) => pair.cred),
            (cred) => !!credentials && credentials.some((cand) => cred.credId === cand.credId)
        );
        if (updates.length) {
            await updateCredentials(updates, network.genesisHash);
        }
        if (newCreds.length) {
            await addCredential(newCreds, network.genesisHash);
        }
        const added = {
            identities: [...identitiesToAdd, ...identitiesToUpdate].map((id) => ({
                index: id.index,
                providerIndex: id.providerIndex,
            })),
            accounts: credsToAdd.map((pair) => {
                return { address: pair.cred.address, balance: pair.balance };
            }),
        };
        respond({ status: BackgroundResponseStatus.Success, added });
    } catch (e) {
        respond({ status: BackgroundResponseStatus.Error, reason: (e as Error).toString() });
    } finally {
        await sessionIsRecovering.set(false);
    }
}

export async function startRecovery() {
    const isRecovering = await sessionIsRecovering.get();
    if (isRecovering) {
        // We use a lock to ensure only 1 recovery instance runs
        navigator.locks.request(RECOVERY_LOCK, { ifAvailable: true }, (lock) => {
            if (!lock) {
                // The lock was not granted - get out fast.
                return Promise.resolve();
            }
            chrome.alarms.create(RECOVERY_ALARM_NAME, { delayInMinutes: 5.1, periodInMinutes: 1 });
            const respond = async (result: RecoveryBackgroundResponse) => {
                await openWindow();
                bgMessageHandler.sendInternalMessage(InternalMessageType.RecoveryFinished, result);
            };
            return performRecovery(respond).finally(() => chrome.alarms.clear(RECOVERY_ALARM_NAME));
        });
    }
}

export async function setupRecoveryHandler() {
    chrome.alarms.onAlarm.addListener(async (alarm) => {
        if (alarm.name === RECOVERY_ALARM_NAME) {
            startRecovery();
        }
    });
    startRecovery();
}
