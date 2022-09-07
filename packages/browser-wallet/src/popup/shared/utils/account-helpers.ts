import { credentialsAtom, selectedAccountAtom } from '@popup/store/account';
import { networkConfigurationAtom, seedPhraseAtom } from '@popup/store/settings';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { identitiesAtom } from '@popup/store/identity';
import { ConcordiumHdWallet } from '@concordium/web-sdk';
import { WalletCredential } from '@shared/storage/types';
import { getNet } from '@shared/utils/network-helpers';

export const displaySplitAddress = (address: string) => `${address.slice(0, 4)}...${address.slice(address.length - 4)}`;

export function useIdentityOf(cred?: WalletCredential) {
    const identities = useAtomValue(identitiesAtom);

    const identity = useMemo(() => {
        if (!cred) {
            return undefined;
        }
        return identities.find((id) => id.index === cred.identityIndex && id.providerIndex === cred.providerIndex);
    }, [JSON.stringify(cred), identities.length]);

    return identity;
}

export function useCredential(accountAddress?: string) {
    const credentials = useAtomValue(credentialsAtom);

    return useMemo(() => {
        if (!accountAddress) {
            return undefined;
        }
        return credentials.find((cred) => cred.address === accountAddress);
    }, [accountAddress, JSON.stringify(credentials)]);
}

export function useSelectedCredential() {
    const selectedAccount = useAtomValue(selectedAccountAtom);
    return useCredential(selectedAccount);
}

export function usePrivateKey(accountAddress: string | undefined): string | undefined {
    const credentials = useAtomValue(credentialsAtom);
    const credential = credentials.find((cred) => cred.address === accountAddress);
    const network = useAtomValue(networkConfigurationAtom);

    const seedPhrase = useAtomValue(seedPhraseAtom);
    const identity = useIdentityOf(credential);

    const privateKey = useMemo(() => {
        // We don't throw errors on missing credentials or identities, as they might just be loading.
        if (!accountAddress || !credential || !identity) {
            return undefined;
        }

        return ConcordiumHdWallet.fromHex(seedPhrase, getNet(network))
            .getAccountSigningKey(identity.providerIndex, identity.index, credential.credNumber)
            .toString('hex');
    }, [credential?.credId, seedPhrase, identity?.index]);

    return privateKey;
}
