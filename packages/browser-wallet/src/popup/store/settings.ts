import { ChromeStorageKey, EncryptedData, NetworkConfiguration, Theme, WalletCredential } from '@shared/storage/types';
import { atom } from 'jotai';
import { EventType } from '@concordium/browser-wallet-api-helpers';
import { popupMessageHandler } from '@popup/shared/message-handler';
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
