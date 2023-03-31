import { credentialsAtom, selectedAccountAtom } from '@popup/store/account';
import { networkConfigurationAtom } from '@popup/store/settings';
import { useAtomValue } from 'jotai';
import { useMemo } from 'react';
import { identitiesAtom } from '@popup/store/identity';
import { AccountInfo, ConcordiumHdWallet } from '@concordium/web-sdk';
import { WalletCredential } from '@shared/storage/types';
import { getNet } from '@shared/utils/network-helpers';
import { isIdentityOfCredential } from '@shared/utils/identity-helpers';
import { getNextUnused } from '@shared/utils/number-helpers';
import { useDecryptedSeedPhrase } from './seed-phrase-helpers';

export const displaySplitAddress = (address: string) => `${address.slice(0, 4)}...${address.slice(address.length - 4)}`;

export function useIdentityOf(cred?: WalletCredential) {
    const identities = useAtomValue(identitiesAtom);

    const identity = useMemo(() => {
        if (!cred) {
            return undefined;
        }
        return identities.find((id) => isIdentityOfCredential(id)(cred));
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

export function useHdWallet(): ConcordiumHdWallet | undefined {
    const network = useAtomValue(networkConfigurationAtom);
    const seedPhrase = useDecryptedSeedPhrase();

    const wallet = useMemo(() => {
        if (!seedPhrase) {
            return undefined;
        }

        return ConcordiumHdWallet.fromHex(seedPhrase, getNet(network));
    }, [seedPhrase]);

    return wallet;
}

export function usePrivateKey(accountAddress: string | undefined): string | undefined {
    const wallet = useHdWallet();
    const credentials = useAtomValue(credentialsAtom);
    const credential = credentials.find((cred) => cred.address === accountAddress);

    const identity = useIdentityOf(credential);

    const privateKey = useMemo(() => {
        // We don't throw errors on missing credentials or identities, as they might just be loading.
        if (!wallet || !identity || !credential) {
            return undefined;
        }

        return wallet
            .getAccountSigningKey(identity.providerIndex, identity.index, credential.credNumber)
            .toString('hex');
    }, [credential?.credId, wallet, identity?.index]);

    return privateKey;
}

export function usePublicKey(accountAddress: string | undefined): string | undefined {
    const wallet = useHdWallet();
    const credentials = useAtomValue(credentialsAtom);
    const credential = credentials.find((cred) => cred.address === accountAddress);
    const identity = useIdentityOf(credential);

    const publicKey = useMemo(() => {
        // We don't throw errors on missing credentials or identities, as they might just be loading.
        if (!wallet || !identity || !credential) {
            return undefined;
        }

        return wallet
            .getAccountPublicKey(identity.providerIndex, identity.index, credential.credNumber)
            .toString('hex');
    }, [credential?.credId, wallet, identity?.index]);

    return publicKey;
}

export function getNextEmptyCredNumber(creds: WalletCredential[]) {
    return getNextUnused(creds.map((cred) => cred.credNumber));
}

export type WithAccountInfo = {
    accountInfo: AccountInfo;
};
