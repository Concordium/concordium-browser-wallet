import { useAtomValue } from 'jotai';
import { useMemo } from 'react';

import { tokensAtom } from '@popup/store/token';
import { TokenIdAndMetadata, WalletCredential } from '@shared/storage/types';

export type TokenDetails = TokenIdAndMetadata & { contractIndex: string };

export function useTokens(account: WalletCredential | undefined): TokenDetails[] {
    const {
        loading,
        value: { [account?.address ?? '']: tokens },
    } = useAtomValue(tokensAtom);
    const items = useMemo(
        () =>
            loading || tokens === undefined
                ? []
                : Object.entries(tokens).flatMap(([contractIndex, ts]) => ts.map((t) => ({ contractIndex, ...t }))),
        [tokens, loading]
    );

    return items;
}
