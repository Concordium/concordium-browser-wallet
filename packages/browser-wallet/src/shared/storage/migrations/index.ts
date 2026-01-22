/* eslint-disable no-console */
import { migrateAddAccountType } from './add-account-type';
import { migrateAddIdentityType } from './add-identity-type';
import { migrateLedgerIdentities } from './migrate-ledger-identities';

/**
 * Runs all necessary storage migrations
 * Should be called on application startup
 */
export async function runStorageMigrations(): Promise<void> {
    try {
        // Run account type migration
        await migrateAddAccountType();

        // Ensure existing identities are tagged as wallet-based
        await migrateAddIdentityType();

        // Convert every identity except the first to Ledger-based
        await migrateLedgerIdentities();

        // Add more migrations here as needed in the future
        // await migrateOtherFeature();

        console.log('Storage migrations completed successfully');
    } catch (error) {
        console.error('Error running storage migrations:', error);
        // Don't throw - allow app to continue even if migration fails
    }
}
