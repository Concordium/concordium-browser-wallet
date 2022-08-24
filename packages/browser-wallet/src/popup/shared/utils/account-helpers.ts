import { selectedAccountAtom } from '@popup/store/account';
import { credentialsAtom, seedPhraseAtom } from '@popup/store/settings';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { identitiesAtom } from '@popup/store/identity';
import { ConcordiumHdWallet, Network as NetworkString } from '@concordium/web-sdk';
import { Network, WalletCredential } from '@shared/storage/types';

export const displaySplitAddress = (address: string) => `${address.slice(0, 4)}...${address.slice(address.length - 4)}`;

export function useIdentityOf(cred?: WalletCredential) {
    const identities = useAtomValue(identitiesAtom);

    const identity = useMemo(() => {
        if (!cred) {
            return undefined;
        }
        return identities.find((id) => id.id === cred.identityId && id.network === cred.net);
    }, [cred, identities.length]);
    return identity;
}

export function useSelectedCredential() {
    const selectedAccount = useAtomValue(selectedAccountAtom);
    const credentials = useAtomValue(credentialsAtom);

    const selectedCredential = useMemo(() => {
        if (!selectedAccount) {
            return undefined;
        }
        return credentials.find((cred) => cred.address === selectedAccount);
    }, [selectedAccount, credentials.length]);

    return selectedCredential;
}

export function usePrivateKey(accountAddress: string): string | undefined {
    const credentials = useAtomValue(credentialsAtom);
    const credential = credentials.find((cred) => cred.address === accountAddress);

    const seedPhrase = useAtomValue(seedPhraseAtom);
    const identity = useIdentityOf(credential);

    const privateKey = useMemo(() => {
        if (!credential || !identity) {
            return undefined;
        }

        return ConcordiumHdWallet.fromHex(seedPhrase, Network[credential.net] as NetworkString)
            .getAccountSigningKey(identity.index, credential.credNumber)
            .toString('hex');
    }, [credential?.credId, seedPhrase, identity?.id]);

    return privateKey;
}
