import { Buffer } from 'buffer/';
import { ChromeStorageKey, EncryptedData, NetworkConfiguration, Theme, WalletCredential } from '@shared/storage/types';
import { atom } from 'jotai';
import { EventType } from '@concordium/browser-wallet-api-helpers';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { decrypt } from '@popup/shared/crypto';
import { mnemonicToSeedSync } from '@scure/bip39';
import { mainnet } from '@popup/pages/NetworkSettings/NetworkSettings';
import { atomWithChromeStorage } from './utils';

export const credentialsAtom = atomWithChromeStorage<WalletCredential[]>(ChromeStorageKey.Credentials, []);
export const encryptedSeedPhraseAtom = atomWithChromeStorage<EncryptedData | undefined>(
    ChromeStorageKey.SeedPhrase,
    undefined,
    true
);
export const themeAtom = atomWithChromeStorage<Theme>(ChromeStorageKey.Theme, Theme.Light);

const storedNetworkConfigurationAtom = atomWithChromeStorage<NetworkConfiguration>(
    ChromeStorageKey.NetworkConfiguration,
    mainnet
);
export const networkConfigurationAtom = atom<NetworkConfiguration, NetworkConfiguration>(
    (get) => get(storedNetworkConfigurationAtom),
    (_, set, networkConfiguration) => {
        set(storedNetworkConfigurationAtom, networkConfiguration);
        popupMessageHandler.broadcast(EventType.ChainChanged, networkConfiguration.genesisHash);
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
