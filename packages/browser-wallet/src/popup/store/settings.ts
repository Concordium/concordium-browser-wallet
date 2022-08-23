import { Buffer } from 'buffer/';
import { ChromeStorageKey, EncryptedData, Theme, WalletCredential } from '@shared/storage/types';
import { atom } from 'jotai';
import { EventType } from '@concordium/browser-wallet-api-helpers';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { decrypt } from '@popup/shared/crypto';
import { mnemonicToSeedSync } from '@scure/bip39';
import { atomWithChromeStorage, AsyncWrapper } from './utils';

export const credentialsAtom = atomWithChromeStorage<WalletCredential[]>(ChromeStorageKey.Credentials, []);
export const encryptedSeedPhraseAtom = atomWithChromeStorage<EncryptedData | undefined>(
    ChromeStorageKey.SeedPhrase,
    undefined,
    true
);
export const themeAtom = atomWithChromeStorage<Theme>(ChromeStorageKey.Theme, Theme.Light);

const storedJsonRpcUrlAtom = atomWithChromeStorage<string>(ChromeStorageKey.JsonRpcUrl, '', true);
export const jsonRpcUrlAtomLoading = atom<AsyncWrapper<string>, string>(
    (get) => get(storedJsonRpcUrlAtom),
    (_, set, jsonRpcUrl) => {
        set(storedJsonRpcUrlAtom, jsonRpcUrl);
        popupMessageHandler.broadcast(EventType.ChainChanged, jsonRpcUrl);
    }
);
export const jsonRpcUrlAtom = atom<string, string>(
    (get) => get(jsonRpcUrlAtomLoading).value,
    (_, set, jsonRpcUrl) => {
        set(jsonRpcUrlAtomLoading, jsonRpcUrl);
    }
);

export const sessionPasscodeAtom = atomWithChromeStorage<string | undefined>(
    ChromeStorageKey.Passcode,
    undefined,
    true
);

export const seedPhraseAtom = atom<string, never>(
    (get) => {
        const seed = get(encryptedSeedPhraseAtom).value;
        const passcode = get(sessionPasscodeAtom).value;

        if (seed && passcode) {
            return Buffer.from(mnemonicToSeedSync(decrypt(seed, passcode))).toString('hex');
        }
        throw new Error('SeedPhrase should not be retrieved without unlocking the wallet.');
    },
    () => {
        throw new Error('Setting the seedPhrase directly is not supported');
    }
);
