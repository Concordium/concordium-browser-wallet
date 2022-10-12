import { popupMessageHandler } from '@popup/shared/message-handler';
import { atom } from 'jotai';
import { selectAtom } from 'jotai/utils';

import {
    ChromeStorageKey,
    TokenIdAndMetadata,
    TokenMetadata,
    TokenStorage,
    WalletCredential,
} from '@shared/storage/types';
import { EventType } from '@concordium/browser-wallet-api-helpers';
import { mapRecordValues } from 'wallet-common-helpers/src/utils/basicHelpers';
import { AsyncWrapper, atomWithChromeStorage } from './utils';

export const credentialsAtom = atomWithChromeStorage<WalletCredential[]>(ChromeStorageKey.Credentials, [], false);

export const storedConnectedSitesAtom = atomWithChromeStorage<Record<string, string[]>>(
    ChromeStorageKey.ConnectedSites,
    {},
    true
);

const storedAccountAtom = atomWithChromeStorage<string | undefined>(ChromeStorageKey.SelectedAccount, undefined);
export const selectedAccountAtom = atom<string | undefined, string | undefined>(
    (get) => get(storedAccountAtom),
    (_, set, address) => {
        set(storedAccountAtom, address);
        popupMessageHandler.broadcast(EventType.AccountChanged, address);
    }
);

export const accountsAtom = selectAtom(credentialsAtom, (cs) => cs.map((c) => c.address));

export const accountsPerIdentityAtom = selectAtom(credentialsAtom, (cs) => {
    const map = {} as Record<number, Record<number, string[]>>;
    cs.forEach((cred) => {
        if (!map[cred.providerIndex]) {
            map[cred.providerIndex] = {} as Record<number, string[]>;
        }
        map[cred.providerIndex][cred.identityIndex] = (map[cred.providerIndex][cred.identityIndex] ?? []).concat([
            cred.address,
        ]);
    });
    return map;
});

export const creatingCredentialRequestAtom = atomWithChromeStorage<boolean>(
    ChromeStorageKey.IsCreatingCredential,
    false,
    true
);

export const storedTokensAtom = atomWithChromeStorage<Record<string, Record<string, TokenStorage[]>>>(
    ChromeStorageKey.Tokens,
    {},
    true
);
export const tokenMetadataAtom = atomWithChromeStorage<Record<string, TokenMetadata>>(
    ChromeStorageKey.TokenMetadata,
    {},
    true
);

export const tokensAtom = atom<AsyncWrapper<Record<string, Record<string, TokenIdAndMetadata[]>>>>((get) => {
    const tokens = get(storedTokensAtom);
    const tokenMetadata = get(tokenMetadataAtom);
    if (tokens.loading || tokenMetadata.loading) {
        return { loading: true, value: {} as Record<string, Record<string, TokenIdAndMetadata[]>> };
    }
    return {
        loading: false,
        value: mapRecordValues(tokens.value, (accountTokens) =>
            mapRecordValues(accountTokens, (collectionTokens) =>
                collectionTokens.map((token) => {
                    return {
                        ...token,
                        metadata: tokenMetadata.value[token.metadataLink],
                    };
                })
            )
        ),
    };
});
