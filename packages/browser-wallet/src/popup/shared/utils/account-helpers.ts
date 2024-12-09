import { credentialsAtom, selectedAccountAtom, writableCredentialAtom } from '@popup/store/account';
import { networkConfigurationAtom } from '@popup/store/settings';
import { useAtom, useAtomValue } from 'jotai';
import { useEffect, useMemo, useState } from 'react';
import { identitiesAtom } from '@popup/store/identity';
import { AccountInfo, ConcordiumHdWallet } from '@concordium/web-sdk';
import { WalletCredential } from '@shared/storage/types';
import { getNet } from '@shared/utils/network-helpers';
import { isIdentityOfCredential } from '@shared/utils/identity-helpers';
import { getNextUnused } from '@shared/utils/number-helpers';
import { useDecryptedSeedPhrase } from './seed-phrase-helpers';

/** Format an account address for display by showing the 4 first and last characters in the base58check representation. */
export function displaySplitAddress(address: string) {
    return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

export function displaySplitAddressShort(address: string) {
    return `${address.slice(0, 3)}...${address.slice(-3)}`;
}

export const displayNameOrSplitAddress = (account: WalletCredential | undefined) => {
    const { credName, address } = account || { address: '' };
    return credName || displaySplitAddress(address);
};

export const displayNameAndSplitAddress = (account: WalletCredential | undefined) => {
    const { credName, address } = account || { address: '' };
    return `${credName ? `${credName} / ` : ''}${displaySplitAddressShort(address)}`;
};

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

export function useIdentityName(credential: WalletCredential, fallback?: string) {
    const [identityName, setIdentityName] = useState<string>();
    const identity = useIdentityOf(credential);

    useEffect(() => {
        if (identity) {
            setIdentityName(identity.name);
        } else if (fallback !== undefined) {
            setIdentityName(fallback);
        }
    }, [identity]);

    return identityName;
}

export function useWritableSelectedAccount(accountAddress: string) {
    const [accounts, setAccounts] = useAtom(writableCredentialAtom);
    const setAccount = (update: Partial<WalletCredential>) =>
        setAccounts(
            accounts.map((account) =>
                account.address === accountAddress ? ({ ...account, ...update } as WalletCredential) : account
            )
        );

    return setAccount;
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

export function useCredentialByCredId(credId?: string) {
    const credentials = useAtomValue(credentialsAtom);

    return useMemo(() => {
        if (!credId) {
            return undefined;
        }
        return credentials.find((cred) => cred.credId === credId);
    }, [credId, JSON.stringify(credentials)]);
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
