import { AccountType, WalletCredential } from '../types';
import { storedCredentials } from '../access';

/**
 * Migration to add accountType field to existing credentials
 * All existing credentials are assumed to be seed phrase-based
 * This should be run on wallet startup/upgrade
 */
export async function migrateAddAccountType(): Promise<void> {
    const credentials = await storedCredentials.get();

    if (!credentials || credentials.length === 0) {
        return;
    }

    // Check if migration is needed (if any credential is missing accountType)
    const needsMigration = credentials.some((cred) => !cred.accountType);

    if (!needsMigration) {
        return;
    }

    // Set all existing credentials to seed phrase-based if they don't have an accountType
    const migratedCredentials = credentials.map(
        (cred): WalletCredential => ({
            ...cred,
            accountType: cred.accountType || AccountType.SeedPhraseBased,
        })
    );

    await storedCredentials.set(migratedCredentials);
}
