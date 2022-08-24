import {
    sessionPasscode,
    StorageAccessor,
    storedConnectedSites,
    storedCredentials,
    storedCurrentNetwork,
    storedEncryptedSeedPhrase,
    storedSelectedAccount,
    storedTheme,
    storedIdentities,
    storedPendingIdentity,
    storedSelectedIdentity,
    storedSeedPhrase,
    storedIdentityProviders,
} from '@shared/storage/access';
import { ChromeStorageKey } from '@shared/storage/types';
import { atom, WritableAtom } from 'jotai';

const accessorMap = {
    [ChromeStorageKey.Identities]: storedIdentities,
    [ChromeStorageKey.PendingIdentity]: storedPendingIdentity,
    [ChromeStorageKey.SelectedIdentity]: storedSelectedIdentity,
    [ChromeStorageKey.ConnectedSites]: storedConnectedSites,
    [ChromeStorageKey.Credentials]: storedCredentials,
    [ChromeStorageKey.SelectedAccount]: storedSelectedAccount,
    [ChromeStorageKey.SeedPhrase]: storedEncryptedSeedPhrase,
    [ChromeStorageKey.NetworkConfiguration]: storedCurrentNetwork,
    [ChromeStorageKey.Theme]: storedTheme,
    [ChromeStorageKey.SeedPhrase]: storedSeedPhrase,
    [ChromeStorageKey.IdentityProviders]: storedIdentityProviders,
    [ChromeStorageKey.Passcode]: sessionPasscode,
};

export type AsyncWrapper<V> = {
    loading: boolean;
    value: V;
};

export function atomWithChromeStorage<V>(
    key: ChromeStorageKey,
    fallback: V,
    withLoading: true
): WritableAtom<AsyncWrapper<V>, V, void>;
export function atomWithChromeStorage<V>(
    key: ChromeStorageKey,
    fallback: V,
    withLoading?: false
): WritableAtom<V, V, void>;

/**
 * @description
 * Create an atom that automatically syncs with chrome local storage.
 */
export function atomWithChromeStorage<V>(key: ChromeStorageKey, fallback: V, withLoading = false) {
    const accessor = accessorMap[key] as unknown as StorageAccessor<V>;

    if (accessor === undefined) {
        throw new Error(`Could not find storage for key: ${key}`);
    }

    const { get: getStoredValue, set: setStoredValue } = accessor;
    const base = atom<AsyncWrapper<V>>({ loading: true, value: fallback });

    base.onMount = (setValue) => {
        getStoredValue().then((value) =>
            setValue({
                loading: false,
                value: value ?? fallback,
            })
        );
    };

    const derived = atom(
        (get) => (withLoading ? get(base) : get(base).value),
        (_, set, next: V) => {
            setStoredValue(next);
            set(base, (v) => ({ ...v, value: next }));
        }
    );

    return derived;
}
