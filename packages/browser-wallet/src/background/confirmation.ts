import { HttpProvider, JsonRpcClient, TransactionStatusEnum } from '@concordium/web-sdk';
import { storedCurrentNetwork, storedCredentials, storedIdentities } from '@shared/storage/access';
import {
    Identity,
    CreationStatus,
    PendingIdentity,
    PendingWalletCredential,
    WalletCredential,
} from '@shared/storage/types';
import { IdentityTokenContainer, IdentityProviderIdentityStatus } from 'wallet-common-helpers/lib/utils/identity/types';
import { updateCredentials, updateIdentities } from './update';

const isPendingCred = (cred: WalletCredential): cred is PendingWalletCredential =>
    cred.status === CreationStatus.Pending;
const isPendingIdentity = (identity: Identity): identity is PendingIdentity =>
    identity.status === CreationStatus.Pending;
const updateIntervalSeconds = 10;

const ID_ALARM = 'check_id';
const CRED_ALARM = 'check_cred';

type CheckFun = () => Promise<boolean>;

const checkStatus = (checkFun: CheckFun, alarmId: string) => async () => {
    const repeat = await checkFun();

    if (!repeat) {
        chrome.alarms.clear(alarmId);
    }
};

const shouldRepeatCheck = async (status: Promise<boolean>[]): Promise<boolean> => {
    const s = await Promise.all(status);
    return s.includes(true);
};

const credentialsChecker: CheckFun = async () => {
    const network = await storedCurrentNetwork.get();

    if (!network) {
        return false;
    }

    const creds = await storedCredentials.get(network.genesisHash);
    const pendingCreds = (creds ?? []).filter(isPendingCred);

    if (pendingCreds.length === 0) {
        return false;
    }

    const client = new JsonRpcClient(new HttpProvider(network.jsonRpcUrl, fetch));

    const status = pendingCreds.map(async (c) => {
        const { deploymentHash, ...info }: PendingWalletCredential = c;
        const response = await client.getTransactionStatus(deploymentHash);

        if (response?.status !== TransactionStatusEnum.Finalized) {
            return true;
        }

        const isSuccessful = Object.values(response?.outcomes || {}).some(
            (outcome) => outcome.result.outcome === 'success'
        );
        await updateCredentials(
            [
                {
                    ...info,
                    status: isSuccessful ? CreationStatus.Confirmed : CreationStatus.Rejected,
                },
            ],
            network.genesisHash
        );

        return false;
    });

    return shouldRepeatCheck(status);
};

const identitiesChecker: CheckFun = async () => {
    const network = await storedCurrentNetwork.get();

    if (!network) {
        return false;
    }

    const identities = await storedIdentities.get(network.genesisHash);
    const pendingIdentities = (identities ?? []).filter(isPendingIdentity);

    if (pendingIdentities.length === 0) {
        return false;
    }

    const status = pendingIdentities.map(async (id) => {
        const { location, ...identity }: PendingIdentity = id;

        const response = (await (await fetch(location)).json()) as IdentityTokenContainer;

        if (![IdentityProviderIdentityStatus.Error, IdentityProviderIdentityStatus.Done].includes(response.status)) {
            return true;
        }

        if (response.status === IdentityProviderIdentityStatus.Error) {
            await updateIdentities(
                [
                    {
                        ...identity,
                        status: CreationStatus.Rejected,
                        error: response.detail,
                    },
                ],
                network.genesisHash
            );
        } else if (response.status === IdentityProviderIdentityStatus.Done) {
            await updateIdentities(
                [
                    {
                        ...identity,
                        status: CreationStatus.Confirmed,
                        idObject: response.token.identityObject,
                    },
                ],
                network.genesisHash
            );
        }

        return false;
    });

    return shouldRepeatCheck(status);
};

const checkCredentialStatus = checkStatus(credentialsChecker, CRED_ALARM);
const checkIdentityStatus = checkStatus(identitiesChecker, ID_ALARM);

const alarmDetails: chrome.alarms.AlarmCreateInfo = { periodInMinutes: updateIntervalSeconds / 60, delayInMinutes: 0 };

export function monitorCredentials() {
    chrome.alarms.create(CRED_ALARM, alarmDetails);
}

export function monitorIdentities() {
    chrome.alarms.create(ID_ALARM, alarmDetails);
}

function monitorEntities() {
    monitorIdentities();
    monitorCredentials();
}

export function addConfirmationListeners() {
    chrome.alarms.onAlarm.addListener((alarm) => {
        if (alarm.name === ID_ALARM) {
            checkIdentityStatus();
        }
        if (alarm.name === CRED_ALARM) {
            checkCredentialStatus();
        }
    });

    chrome.runtime.onStartup.addListener(monitorEntities);
    chrome.runtime.onInstalled.addListener(monitorEntities);
}
