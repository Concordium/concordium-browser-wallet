import { CcdAmount, ChainParameters } from '@concordium/web-sdk/types';

export function cpBakingThreshold(cp: ChainParameters): CcdAmount.Type {
    switch (cp.version) {
        case 0: {
            return cp.minimumThresholdForBaking;
        }
        case 1:
        case 2: {
            return cp.minimumEquityCapital;
        }
        default:
            throw new Error('Non-supported chain parameters version');
    }
}
