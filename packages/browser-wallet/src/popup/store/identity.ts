import { ChromeStorageKey, Identity, PendingIdentity, IdentityProvider } from '@shared/storage/types';
import { atom } from 'jotai';
import { atomWithChromeStorage } from './utils';

export const identitiesAtom = atomWithChromeStorage<Identity[]>(ChromeStorageKey.Identities, []);
export const pendingIdentityAtom = atomWithChromeStorage<Omit<PendingIdentity, 'location'> | undefined>(
    ChromeStorageKey.PendingIdentity,
    undefined
);
export const selectedIdentityIdAtom = atomWithChromeStorage<number>(ChromeStorageKey.SelectedIdentity, 0);
export const selectedIdentityAtom = atom<Identity | undefined, Identity | undefined>(
    (get) => {
        const identities = get(identitiesAtom);
        const id = get(selectedIdentityIdAtom);
        return identities.find((a) => a.id === id);
    },
    (get, set, selectedIdentity) => {
        // Also update the identities atom.
        if (selectedIdentity) {
            const identities = get(identitiesAtom);
            const id = get(selectedIdentityIdAtom);
            const index = identities.findIndex((i) => i.id === id);
            if (selectedIdentity.id !== id) {
                throw new Error('Updating selected identity with new id');
            }
            identities[index] = selectedIdentity;
            set(identitiesAtom, identities);
        }
    }
);

export const identityProvidersAtom = atomWithChromeStorage<IdentityProvider[]>(ChromeStorageKey.IdentityProviders, []);

export const identityNamesAtom = atom<Record<number, string>>((get) => {
    const identities = get(identitiesAtom);
    return identities.reduce((map, identity) => map[identity.id] === identity.name, {});
});
