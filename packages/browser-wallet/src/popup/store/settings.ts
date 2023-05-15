import {
    AcceptedTermsState,
    ChromeStorageKey,
    EncryptedData,
    NetworkConfiguration,
    Theme,
} from '@shared/storage/types';
import { atom } from 'jotai';
import { EventType } from '@concordium/browser-wallet-api-helpers';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { ConcordiumGRPCClient, createConcordiumClient } from '@concordium/web-sdk';
import { storedConnectedSites, storedCredentials } from '@shared/storage/access';
import { GRPCTIMEOUT, mainnet } from '@shared/constants/networkConfiguration';
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
export const networkConfigurationAtom = atom<NetworkConfiguration, NetworkConfiguration, Promise<void>>(
    (get) => get(storedNetworkConfigurationAtom),
    async (_, set, networkConfiguration) => {
        const networkPromise = set(storedNetworkConfigurationAtom, networkConfiguration);
        const identityPromise = set(selectedIdentityIndexAtom, 0);

        const credentials = await storedCredentials.get(networkConfiguration.genesisHash);
        const selectedAccount = credentials?.length ? credentials[0]?.address : undefined;
        const accountPromise = set(selectedAccountAtom, selectedAccount);

        // Wait for all the derived state of a network change to be done before broadcasting
        await Promise.all([networkPromise, identityPromise, accountPromise]);

        const connectedSites = await storedConnectedSites.get();
        const sortedConnectedSites = connectedSites
            ? Object.entries(connectedSites).sort(([accountA], [accountB]) => {
                  if (credentials === undefined) {
                      return 0;
                  }
                  return (
                      credentials.findIndex((c) => c.address === accountA) -
                      credentials.findIndex((c) => c.address === accountB)
                  );
              })
            : undefined;

        popupMessageHandler.broadcast(EventType.ChainChanged, networkConfiguration.genesisHash, {
            requireWhitelist: false,
            nonWhitelistedTabCallback: ({ url }) => {
                if (!url) {
                    return;
                }

                // If tab has any account connected, send account changed event, otherwise account disconnected.
                const filtered = sortedConnectedSites?.filter(([, sites]) => sites.some((s) => url.startsWith(s)));
                const firstConnectedAccount = filtered?.[0]?.[0];
                if (firstConnectedAccount) {
                    popupMessageHandler.broadcastToUrl(EventType.AccountChanged, url, firstConnectedAccount);
                } else {
                    popupMessageHandler.broadcastToUrl(EventType.AccountDisconnected, url);
                }
            },
        });
    }
);

export const grpcClientAtom = atom<ConcordiumGRPCClient>((get) => {
    const network = get(storedNetworkConfigurationAtom);

    return createConcordiumClient(network.grpcUrl, network.grpcPort, { timeout: GRPCTIMEOUT });
});

export const acceptedTermsAtom = atomWithChromeStorage<AcceptedTermsState | undefined>(
    ChromeStorageKey.AcceptedTerms,
    undefined,
    true
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
