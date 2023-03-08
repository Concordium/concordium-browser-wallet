import { ChainParametersV1, ConsensusStatus, RewardStatusV1 } from '@concordium/web-sdk';
import { createContext } from 'react';

export type EarnPageContext = {
    chainParameters?: ChainParametersV1;
    consensusStatus?: ConsensusStatus;
    tokenomicsInfo?: RewardStatusV1;
};

/* The percentage threshold, over which the user should be displayed an error, if they attempt to stake that much */
export const STAKE_WARNING_THRESHOLD = 95n;

/**
 * Given a type predicate, return a function that only returns elements that satisfies the predicate, otherwise it return undefined.
 */
export function filterType<A, B extends A>(predicate: (x: A) => x is B): (x: A) => B | undefined {
    return (x: A) => {
        if (!predicate(x)) {
            return undefined;
        }
        return x;
    };
}

export const earnPageContext = createContext<EarnPageContext>({});
