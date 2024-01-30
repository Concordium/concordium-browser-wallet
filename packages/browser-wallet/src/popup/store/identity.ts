import {
    ChromeStorageKey,
    ConfirmedIdentity,
    CreationStatus,
    Identity,
    IdentityProvider,
    RecoveryPayload,
    RecoveryStatus,
    SessionPendingIdentity,
} from '@shared/storage/types';
import { Atom, atom, WritableAtom } from 'jotai';
import { atomFamily, selectAtom } from 'jotai/utils';
import { credentialsAtomWithLoading } from './account';
import { AsyncWrapper, atomWithChromeStorage } from './utils';

export const identitiesAtomWithLoading = atomWithChromeStorage<Identity[]>(ChromeStorageKey.Identities, [], true);
export const identitiesAtom: WritableAtom<Identity[], Identity[], Promise<void>> = atom(
    (get) => get(identitiesAtomWithLoading).value,
    (_, set, update) => set(identitiesAtomWithLoading, update)
);
export const pendingIdentityAtom = atomWithChromeStorage<SessionPendingIdentity | undefined>(
    ChromeStorageKey.PendingIdentity,
    undefined
);
// The index here refers to the position in the list.
export const selectedIdentityIndexAtom = atomWithChromeStorage<number>(ChromeStorageKey.SelectedIdentity, 0);
export const selectedIdentityAtom = atom<Identity | undefined, Identity | undefined>(
    (get) => {
        const identities = get(identitiesAtom);
        const selectedIndex = get(selectedIdentityIndexAtom);
        return identities[selectedIndex];
    },
    (get, set, selectedIdentity) => {
        // Also update the identities atom.
        if (selectedIdentity) {
            const identities = get(identitiesAtom);
            const selectedIndex = get(selectedIdentityIndexAtom);
            const newIdentities = [...identities];
            newIdentities[selectedIndex] = selectedIdentity;
            set(identitiesAtom, newIdentities);
        }
    }
);

export const identityProvidersAtom = atomWithChromeStorage<IdentityProvider[]>(ChromeStorageKey.IdentityProviders, []);

export const isRecoveringAtom = atomWithChromeStorage<boolean>(ChromeStorageKey.IsRecovering, false, true);
const recoveryStatusAtom = atomWithChromeStorage<RecoveryStatus | undefined>(
    ChromeStorageKey.RecoveryStatus,
    undefined,
    true
);
export const setRecoveryPayloadAtom = atom<null, RecoveryPayload, Promise<void>>(null, (_, set, payload) =>
    set(recoveryStatusAtom, { payload })
);
export const recoveryNewIdentitiesAtom = selectAtom(recoveryStatusAtom, (v) => v.value?.identitiesToAdd);

export const identityByAddressAtomFamily = atomFamily<
    string | undefined,
    Atom<AsyncWrapper<ConfirmedIdentity | undefined>>
>((address) =>
    atom((get) => {
        const creds = get(credentialsAtomWithLoading);
        const ids = get(identitiesAtomWithLoading);

        if (creds.loading || ids.loading) {
            return { loading: true, value: undefined };
        }

        const cred = creds.value.find((c) => c.address === address);
        const identities = ids.value;

        return {
            loading: false,
            value: identities
                .filter((i) => i.status === CreationStatus.Confirmed)
                .find((i) => i.providerIndex === cred?.providerIndex && i.index === cred.identityIndex) as
                | ConfirmedIdentity
                | undefined,
        };
    })
);
