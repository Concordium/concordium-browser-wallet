import { storedIdentities } from '../access';
import { ChromeStorageKey, Identity, IdentityType } from '../types';

/**
 * Migration to ensure all stored identities have an explicit identity type.
 * Existing identities were implicitly wallet-based, so we mark them accordingly.
 */
export async function migrateAddIdentityType(): Promise<void> {
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

            const needsMigration = identities.some((identity) => !identity.type);
            if (!needsMigration) {
                return;
            }

            const migratedIdentities = identities.map(
                (identity): Identity => ({
                    ...identity,
                    type: identity.type || IdentityType.WalletBased,
                })
            );

            await storedIdentities.set(genesisHash, migratedIdentities);
        })
    );
}
