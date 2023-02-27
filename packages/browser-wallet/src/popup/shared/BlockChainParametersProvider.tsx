import { ChainParameters } from '@concordium/web-sdk';
import { grpcClientAtom } from '@popup/store/settings';
import { useAtomValue } from 'jotai';
import React, { createContext, ReactNode, useCallback, useContext, useRef } from 'react';
import { useAsyncMemo } from 'wallet-common-helpers';

export const blockChainParametersContext = createContext<() => Promise<ChainParameters>>(() => Promise.reject());

interface Props {
    children: ReactNode;
}

/**
 * Context for enabling the useBlockChainParameters hook.
 * Caches the parameter values to avoid unnecessary calls to the node.
 */
export default function BlockChainParametersContext({ children }: Props) {
    const chainParameters = useRef<Promise<ChainParameters> | undefined>(undefined);
    const client = useAtomValue(grpcClientAtom);

    const getBlockChainParameters = useCallback(() => {
        if (chainParameters.current) {
            return chainParameters.current;
        }
        const params = client.getBlockChainParameters();
        chainParameters.current = params;
        return params;
    }, []);

    return (
        <blockChainParametersContext.Provider value={getBlockChainParameters}>
            {children}
        </blockChainParametersContext.Provider>
    );
}

/**
 * Hook for getting the blockchain parameters.
 */
export function useBlockChainParameters() {
    const getBlockChainParameters = useContext(blockChainParametersContext);
    return useAsyncMemo(getBlockChainParameters, undefined, []);
}
