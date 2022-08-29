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
    }, [selectedAccount, JSON.stringify(credentials)]);

    return selectedCredential;
}

export function usePrivateKey(accountAddress: string): string;
export function usePrivateKey(accountAddress: undefined): undefined;
export function usePrivateKey(accountAddress: string | undefined): string | undefined;
export function usePrivateKey(accountAddress: string | undefined): string | undefined {
    const credentials = useAtomValue(credentialsAtom);
    const seedPhrase = useAtomValue(seedPhraseAtom);
    const credential = credentials.find((cred) => cred.address === accountAddress);
    const identity = useIdentityOf(credential);

    const privateKey = useMemo(() => {
        if (!accountAddress) {
            return undefined;
        }

        if (!credential || !identity) {
            throw new Error('No credential or identity found for given account address');
        }

        return ConcordiumHdWallet.fromHex(seedPhrase, Network[credential.net] as NetworkString)
            .getAccountSigningKey(identity.index, credential.credNumber)
            .toString('hex');
    }, [credential?.credId, seedPhrase, identity?.id]);

    return privateKey;
}
