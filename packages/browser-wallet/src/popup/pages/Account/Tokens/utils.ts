import { useAtomValue } from 'jotai';
import { useMemo } from 'react';

import { tokensAtom } from '@popup/store/token';
import { TokenIdAndMetadata, WalletCredential } from '@shared/storage/types';

export type AccountTokenDetails = TokenIdAndMetadata & { contractIndex: string };

export function useFlattenedAccountTokens(account: WalletCredential | undefined): AccountTokenDetails[] {
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
