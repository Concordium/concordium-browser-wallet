import { ChromeStorageKey, EncryptedData, NetworkConfiguration, Theme } from '@shared/storage/types';
import { atom } from 'jotai';
import { EventType } from '@concordium/browser-wallet-api-helpers';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { mainnet } from '@popup/pages/NetworkSettings/NetworkSettings';
import { selectAtom } from 'jotai/utils';
import { HttpProvider, JsonRpcClient } from '@concordium/web-sdk';
import { storedCredentials } from '@shared/storage/access';
import { atomWithChromeStorage } from './utils';
import { selectedAccountAtom } from './account';
import { selectedIdentityIndexAtom } from './identity';

export const encryptedSeedPhraseAtom = atomWithChromeStorage<EncryptedData | undefined>(
    ChromeStorageKey.SeedPhrase,
    undefined,
    true
);
export const themeAtom = atomWithChromeStorage<Theme>(ChromeStorageKey.Theme, Theme.Light);
export const hasBeenOnBoardedAtom = atomWithChromeStorage<boolean>(ChromeStorageKey.HasBeenOnboarded, false, true);

const storedNetworkConfigurationAtom = atomWithChromeStorage<NetworkConfiguration>(
    ChromeStorageKey.NetworkConfiguration,
    mainnet
);
export const networkConfigurationAtom = atom<NetworkConfiguration, NetworkConfiguration>(
    (get) => get(storedNetworkConfigurationAtom),
    (_, set, networkConfiguration) => {
        set(storedNetworkConfigurationAtom, networkConfiguration);
        popupMessageHandler.broadcast(EventType.ChainChanged, networkConfiguration.genesisHash);
        set(selectedIdentityIndexAtom, 0);
        storedCredentials
            .get(networkConfiguration.genesisHash)
            .then((creds) => set(selectedAccountAtom, creds?.length ? creds[0]?.address : undefined));
    }
);

export const jsonRpcClientAtom = selectAtom(
    networkConfigurationAtom,
    ({ jsonRpcUrl }) => new JsonRpcClient(new HttpProvider(jsonRpcUrl))
);

export const sessionPasscodeAtom = atomWithChromeStorage<string | undefined>(
    ChromeStorageKey.Passcode,
    undefined,
    true
);

export const sessionOnboardingLocationAtom = atomWithChromeStorage<string | undefined>(
    ChromeStorageKey.OnboardingLocation,
    undefined,
    true
);
