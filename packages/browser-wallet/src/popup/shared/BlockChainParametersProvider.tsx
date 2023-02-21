import { ChainParameters } from '@concordium/web-sdk';
import { grpcClientAtom } from '@popup/store/settings';
import { useAtomValue } from 'jotai';
import React, { createContext, ReactNode, useCallback, useContext, useRef } from 'react';
import { useAsyncMemo } from 'wallet-common-helpers';

export const blockChainParametersContext = createContext<() => Promise<ChainParameters>>(() => Promise.reject());

interface Props {
    children: ReactNode;
}

export default function BlockChainParametersContext({ children }: Props) {
    const chainParameters = useRef<ChainParameters | undefined>(undefined);
    const client = useAtomValue(grpcClientAtom);

    const getBlockChainParameters = useCallback(async () => {
        if (chainParameters.current) {
            return chainParameters.current;
        }
        const params = await client.getBlockChainParameters();
        chainParameters.current = params;
        return params;
    }, []);

    return (
        <blockChainParametersContext.Provider value={getBlockChainParameters}>
            {children}
        </blockChainParametersContext.Provider>
    );
}

export function useBlockChainParameters() {
    const getBlockChainParameters = useContext(blockChainParametersContext);
    return useAsyncMemo(getBlockChainParameters, undefined, []);
}
