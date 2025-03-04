import { CcdAmount, ChainParameters, ChainParametersV0 } from '@concordium/web-sdk/types';

export function cpBakingThreshold(cp: ChainParameters): CcdAmount.Type {
    switch (cp.version) {
        case 0: {
            return cp.minimumThresholdForBaking;
        }
        case 1:
        case 2:
        case 3: {
            return cp.minimumEquityCapital;
        }
        default:
            throw new Error('Non-supported chain parameters version');
    }
}

/** Get the staking cooldown from the chain parameters. */
export function cpStakingCooldown(cp: Exclude<ChainParameters, ChainParametersV0>): bigint {
    // From protocol version 7, the lower of the two values is the value that counts.
    return cp.poolOwnerCooldown < cp.delegatorCooldown ? cp.poolOwnerCooldown : cp.delegatorCooldown;
}
