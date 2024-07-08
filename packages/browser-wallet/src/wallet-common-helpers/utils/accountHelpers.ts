import type { AccountInfo, AccountInfoBaker, AccountInfoDelegator } from '@concordium/web-sdk';
import { max } from './basicHelpers';

export interface PublicAccountAmounts {
    total: bigint;
    staked: bigint;
    scheduled: bigint;
    atDisposal: bigint;
}

/**
 * Extracts the different public balances from the account info. The 'at disposal' value is
 * not extracted directly from the object, but is calculated as the 'total - max(scheduled, staked)'.
 * This can be done because when staking any scheduled amount is used up first.
 * @param accountInfo the accountInfo retrieved from a node. If undefined, then all balances are set to 0.
 * @returns an object containing the staked, scheduled, at disposal and total public balance amounts.
 */
export function getPublicAccountAmounts(accountInfo?: AccountInfo): PublicAccountAmounts {
    if (!accountInfo) {
        return { total: 0n, staked: 0n, scheduled: 0n, atDisposal: 0n };
    }
    const total = BigInt(accountInfo.accountAmount.microCcdAmount);
    const staked =
        (accountInfo as AccountInfoBaker).accountBaker?.stakedAmount.microCcdAmount ??
        (accountInfo as AccountInfoDelegator).accountDelegation?.stakedAmount.microCcdAmount ??
        0n;
    const scheduled = accountInfo.accountReleaseSchedule
        ? BigInt(accountInfo.accountReleaseSchedule.total.microCcdAmount)
        : 0n;
    const atDisposal = total - max(scheduled, staked);
    return { total, staked, scheduled, atDisposal };
}
