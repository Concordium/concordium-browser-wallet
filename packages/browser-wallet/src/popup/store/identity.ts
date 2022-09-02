import { ChromeStorageKey, Identity, PendingIdentity, IdentityProvider } from '@shared/storage/types';
import { atom } from 'jotai';
import { selectAtom } from 'jotai/utils';
import { atomWithChromeStorage } from './utils';

export const identitiesAtom = atomWithChromeStorage<Identity[]>(ChromeStorageKey.Identities, [], false, true);
export const pendingIdentityAtom = atomWithChromeStorage<Omit<PendingIdentity, 'location'> | undefined>(
    ChromeStorageKey.PendingIdentity,
    undefined
);
export const selectedIdentityIndexAtom = atomWithChromeStorage<number>(ChromeStorageKey.SelectedIdentity, 0);
export const selectedIdentityAtom = atom<Identity | undefined, Identity | undefined>(
    (get) => {
        const identities = get(identitiesAtom);
        const selectedIndex = get(selectedIdentityIndexAtom);
        return identities.find((a) => a.index === selectedIndex);
    },
    (get, set, selectedIdentity) => {
        // Also update the identities atom.
        if (selectedIdentity) {
            const identities = get(identitiesAtom);
            const selectedIndex = get(selectedIdentityIndexAtom);
            const index = identities.findIndex((i) => i.index === selectedIndex);
            if (selectedIdentity.index !== selectedIndex) {
                throw new Error('Updating selected identity with new id');
            }
            const newIdentities = [...identities];
            newIdentities[index] = selectedIdentity;
            set(identitiesAtom, newIdentities);
        }
    }
);

export const identityProvidersAtom = atomWithChromeStorage<IdentityProvider[]>(ChromeStorageKey.IdentityProviders, []);

export const identityNamesAtom = selectAtom(identitiesAtom, (identities) => {
    const map = {} as Record<number, string>;
    identities.forEach((identity) => {
        map[identity.index] = identity.name;
    });
    return map;
});
