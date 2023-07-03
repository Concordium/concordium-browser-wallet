import { ChainParameters, ChainParametersV0, isChainParametersV0 } from '@concordium/web-sdk';
import { filterType } from '@popup/pages/Account/Earn/utils';
import { grpcClientAtom, networkConfigurationAtom } from '@popup/store/settings';
import { useAtomValue } from 'jotai';
import React, { createContext, ReactNode, useCallback, useContext, useEffect, useRef } from 'react';
import { useAsyncMemo } from 'wallet-common-helpers';

const blockChainParametersContext = createContext<() => Promise<ChainParameters>>(() => Promise.reject());

interface Props {
    children: ReactNode;
}

/**
 * Context for enabling the useBlockChainParameters hook.
 * Caches the parameter values to avoid unnecessary calls to the node.
 */
export default function BlockChainParametersContext({ children }: Props) {
    const chainParameters = useRef<Promise<ChainParameters> | undefined>(undefined);
    const currentNetwork = useAtomValue(networkConfigurationAtom);
    const client = useAtomValue(grpcClientAtom);

    useEffect(() => {
        chainParameters.current = undefined;
    }, [currentNetwork.genesisHash]);

    const getBlockChainParameters = useCallback(() => {
        if (chainParameters.current) {
            return chainParameters.current;
        }
        const params = client.getBlockChainParameters();
        chainParameters.current = params;
        return params;
    }, [client]);

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

function isNotChainParametersV0(params: ChainParameters): params is Exclude<ChainParameters, ChainParametersV0> {
    return !isChainParametersV0(params);
}

/**
 * Hook for getting the blockchain parameters that ensures the parameters are version 1.
 * If the parameters are not version 1, undefined is returned instead.
 */
export function useBlockChainParametersAboveV0() {
    const getBlockChainParameters = useContext(blockChainParametersContext);
    const chainParameters = useAsyncMemo(getBlockChainParameters, undefined, []);
    return chainParameters ? filterType(isNotChainParametersV0)(chainParameters) : undefined;
}
