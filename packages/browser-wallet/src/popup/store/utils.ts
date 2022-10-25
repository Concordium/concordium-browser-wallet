import {
    sessionPasscode,
    StorageAccessor,
    getGenesisHash,
    useIndexedStorage,
    storedConnectedSites,
    storedCredentials,
    storedCurrentNetwork,
    storedEncryptedSeedPhrase,
    storedSelectedAccount,
    storedTheme,
    storedIdentities,
    sessionPendingIdentity,
    storedSelectedIdentity,
    storedIdentityProviders,
    sessionCreatingCredential,
    sessionAccountInfoCache,
    sessionIsRecovering,
    storedHasBeenOnboarded,
    sessionOnboardingLocation,
    sessionRecoveryStatus,
    sessionIdpTab,
    storedTokens,
    storedTokenMetadata,
    sessionPendingTransactions,
} from '@shared/storage/access';
import { ChromeStorageKey } from '@shared/storage/types';
import { atom, WritableAtom } from 'jotai';

const accessorMap = {
    [ChromeStorageKey.Identities]: useIndexedStorage(storedIdentities, getGenesisHash),
    [ChromeStorageKey.SelectedIdentity]: storedSelectedIdentity,
    [ChromeStorageKey.ConnectedSites]: storedConnectedSites,
    [ChromeStorageKey.Credentials]: useIndexedStorage(storedCredentials, getGenesisHash),
    [ChromeStorageKey.SelectedAccount]: storedSelectedAccount,
    [ChromeStorageKey.SeedPhrase]: storedEncryptedSeedPhrase,
    [ChromeStorageKey.NetworkConfiguration]: storedCurrentNetwork,
    [ChromeStorageKey.Theme]: storedTheme,
    [ChromeStorageKey.IdentityProviders]: useIndexedStorage(storedIdentityProviders, getGenesisHash),
    [ChromeStorageKey.HasBeenOnboarded]: storedHasBeenOnboarded,
    [ChromeStorageKey.Passcode]: sessionPasscode,
    [ChromeStorageKey.IsRecovering]: sessionIsRecovering,
    [ChromeStorageKey.PendingIdentity]: sessionPendingIdentity,
    [ChromeStorageKey.IsCreatingCredential]: sessionCreatingCredential,
    [ChromeStorageKey.AccountInfoCache]: useIndexedStorage(sessionAccountInfoCache, getGenesisHash),
    [ChromeStorageKey.OnboardingLocation]: sessionOnboardingLocation,
    [ChromeStorageKey.RecoveryStatus]: sessionRecoveryStatus,
    [ChromeStorageKey.IdpTab]: sessionIdpTab,
    [ChromeStorageKey.Tokens]: useIndexedStorage(storedTokens, getGenesisHash),
    [ChromeStorageKey.TokenMetadata]: storedTokenMetadata,
    [ChromeStorageKey.PendingTransactions]: useIndexedStorage(sessionPendingTransactions, getGenesisHash),
};

export type AsyncWrapper<V> = {
    loading: boolean;
    value: V;
};

export function atomWithChromeStorage<V>(
    key: ChromeStorageKey,
    fallback: V,
    withLoading: true
): WritableAtom<AsyncWrapper<V>, V, Promise<void>>;
export function atomWithChromeStorage<V>(
    key: ChromeStorageKey,
    fallback: V,
    withLoading?: false
): WritableAtom<V, V, Promise<void>>;

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
        const refreshValue = () => {
            getStoredValue().then((value) =>
                setValue({
                    loading: false,
                    value: value ?? fallback,
                })
            );
        };

        refreshValue();

        const listener = (changes: Record<string, chrome.storage.StorageChange>) => {
            if (key in changes || ChromeStorageKey.NetworkConfiguration in changes) {
                refreshValue();
            }
        };
        chrome.storage[accessor.area].onChanged.addListener(listener);

        return () => {
            chrome.storage[accessor.area].onChanged.removeListener(listener);
            if (withLoading) {
                setValue({ loading: true, value: fallback });
            }
        };
    };

    const derived = atom(
        (get) => (withLoading ? get(base) : get(base).value),
        async (_, set, next: V) => {
            await setStoredValue(next);
            set(base, (v) => ({ ...v, value: next }));
        }
    );

    return derived;
}
