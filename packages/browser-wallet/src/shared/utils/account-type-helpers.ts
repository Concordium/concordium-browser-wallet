import { AccountType, WalletCredential } from '@shared/storage/types';

/**
 * Checks if a credential is seed phrase-based
 * @param credential - The wallet credential to check
 * @returns true if the account is seed phrase-based
 */
export function isSeedPhraseAccount(credential: WalletCredential): boolean {
    return credential.accountType === AccountType.SeedPhraseBased || !credential.accountType; // Backward compatibility
}

/**
 * Checks if a credential is Ledger-based
 * @param credential - The wallet credential to check
 * @returns true if the account is Ledger-based
 */
export function isLedgerAccount(credential: WalletCredential): boolean {
    return credential.accountType === AccountType.LedgerBased;
}

/**
 * Gets a human-readable label for the account type
 * @param credential - The wallet credential
 * @returns A string label for the account type
 */
export function getAccountTypeLabel(credential: WalletCredential): string {
    if (isLedgerAccount(credential)) {
        return 'Ledger Device';
    }
    return 'Browser Wallet';
}

/**
 * Checks if a transaction requires Ledger device for signing
 * @param credential - The wallet credential
 * @returns true if Ledger is required
 */
export function requiresLedger(credential: WalletCredential): boolean {
    return isLedgerAccount(credential);
}

/**
 * Gets the Ledger derivation path for an account
 * @param credential - The wallet credential
 * @returns The BIP44 derivation path or undefined if not a Ledger account
 */
export function getLedgerDerivationPath(credential: WalletCredential): string | undefined {
    return credential.ledgerPath;
}

/**
 * Gets the Ledger device ID for an account
 * @param credential - The wallet credential
 * @returns The device ID or undefined if not a Ledger account
 */
export function getLedgerDeviceId(credential: WalletCredential): string | undefined {
    return credential.ledgerDeviceId;
}
