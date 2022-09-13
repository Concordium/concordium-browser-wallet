import { ChromeStorageKey, Identity, PendingIdentity, IdentityProvider } from '@shared/storage/types';
import { atom } from 'jotai';
import { selectAtom } from 'jotai/utils';
import { atomWithChromeStorage } from './utils';

export const identitiesAtom = atomWithChromeStorage<Identity[]>(ChromeStorageKey.Identities, [], false);
export const pendingIdentityAtom = atomWithChromeStorage<Omit<PendingIdentity, 'location'> | undefined>(
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

export const identityNamesAtom = selectAtom(identitiesAtom, (identities) => {
    const map = {} as Record<number, Record<number, string>>;
    identities.forEach((identity) => {
        if (!map[identity.providerIndex]) {
            map[identity.providerIndex] = {} as Record<number, string>;
        }
        map[identity.providerIndex][identity.index] = identity.name;
    });
    return map;
});

export const isRecoveringAtom = atomWithChromeStorage<boolean>(ChromeStorageKey.IsRecovering, false, true, true);
