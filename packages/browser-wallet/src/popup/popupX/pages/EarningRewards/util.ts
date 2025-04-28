import { AccountInfo } from '@concordium/web-sdk';

/* The percentage threshold, over which the user should be displayed an error, if they attempt to stake that much */
export const STAKE_WARNING_THRESHOLD = 95n;

export function isAboveStakeWarningThreshold(amount: bigint, accountInfo: AccountInfo): boolean {
    return amount * 100n > accountInfo.accountAmount.microCcdAmount * STAKE_WARNING_THRESHOLD;
}
