import { storedIdentities } from '../access';
import { ChromeStorageKey, Identity, IdentityType } from '../types';

/**
 * Migration that backfills identity types for legacy entries.
 * Any identity missing an explicit type will be marked as wallet-based.
 */
export async function migrateLedgerIdentities(): Promise<void> {
    const stored = await chrome.storage.local.get(ChromeStorageKey.Identities);
    const identitiesByNetwork = stored[ChromeStorageKey.Identities] as Record<string, Identity[]> | undefined;

    if (!identitiesByNetwork) {
        return;
    }

    await Promise.all(
        Object.entries(identitiesByNetwork).map(async ([genesisHash, identities]) => {
            if (!Array.isArray(identities) || identities.length === 0) {
                return;
            }

            let hasChanges = false;

            const migrated = identities.map((identity) => {
                if (!identity.type) {
                    hasChanges = true;
                    return { ...identity, type: IdentityType.WalletBased };
                }
                return identity;
            });

            if (hasChanges) {
                await storedIdentities.set(genesisHash, migrated);
            }
        })
    );
}
