/* eslint-disable no-console */
import { migrateAddAccountType } from './add-account-type';

/**
 * Runs all necessary storage migrations
 * Should be called on application startup
 */
export async function runStorageMigrations(): Promise<void> {
    try {
        // Run account type migration
        await migrateAddAccountType();

        // Add more migrations here as needed in the future
        // await migrateOtherFeature();

        console.log('Storage migrations completed successfully');
    } catch (error) {
        console.error('Error running storage migrations:', error);
        // Don't throw - allow app to continue even if migration fails
    }
}
