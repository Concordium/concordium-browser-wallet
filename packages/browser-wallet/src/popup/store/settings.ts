import {
    AcceptedTermsState,
    ChromeStorageKey,
    EncryptedData,
    NetworkConfiguration,
    Theme,
    UiStyle,
} from '@shared/storage/types';
import { atom } from 'jotai';
import { EventType } from '@concordium/browser-wallet-api-helpers';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { getIdentityProviders } from '@popup/shared/utils/wallet-proxy';
import { logErrorMessage } from '@shared/utils/log-helpers';
import { ConcordiumGRPCClient, ConcordiumGRPCWebClient } from '@concordium/web-sdk';
import { storedAllowlist, storedCredentials } from '@shared/storage/access';
import { GRPCTIMEOUT, mainnet, customnet } from '@shared/constants/networkConfiguration';
import { atomWithChromeStorage } from './utils';
import { selectedAccountAtom } from './account';
import { identityProvidersAtom, selectedIdentityIndexAtom } from './identity';

export const encryptedSeedPhraseAtom = atomWithChromeStorage<EncryptedData | undefined>(
    ChromeStorageKey.SeedPhrase,
    undefined,
    true
);
export const themeAtom = atomWithChromeStorage<Theme>(ChromeStorageKey.Theme, Theme.Light);
export const uiStyleAtom = atomWithChromeStorage<UiStyle>(ChromeStorageKey.UiStyle, UiStyle.Old, true);
export const hasBeenOnBoardedAtom = atomWithChromeStorage<boolean>(ChromeStorageKey.HasBeenOnboarded, false, true);
export const hasBeenSavedSeedAtom = atomWithChromeStorage<boolean>(ChromeStorageKey.HasBeenSavedSeed, true, false);

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

        // As identity providers are different per network, we must also reset the list of cached
        // identity providers when the network configuration is changed.
        const identityProviders = await getIdentityProviders().catch(() => {
            logErrorMessage('Unable to update identity provider list');
        });
        const identityProviderPromise = set(identityProvidersAtom, identityProviders || []);

        // Wait for all the derived state of a network change to be done before broadcasting
        await Promise.all([networkPromise, identityPromise, accountPromise, identityProviderPromise]);

        const allowlist = await storedAllowlist.get();
        popupMessageHandler.broadcast(EventType.ChainChanged, networkConfiguration.genesisHash, {
            requireWhitelist: false,
            nonWhitelistedTabCallback: ({ url }) => {
                if (!url || !allowlist || !allowlist[url]) {
                    return;
                }

                // If tab has any account connected, send account changed event, otherwise account disconnected.
                const firstConnectedAccount = allowlist[url].length > 0 ? allowlist[url][0] : undefined;
                if (firstConnectedAccount) {
                    popupMessageHandler.broadcastToUrl(EventType.AccountChanged, url, firstConnectedAccount);
                } else {
                    popupMessageHandler.broadcastToUrl(EventType.AccountDisconnected, url);
                }
            },
        });
    }
);

export const customNetworkConfigurationAtom = atomWithChromeStorage<NetworkConfiguration>(
    ChromeStorageKey.CustomNetworkConfiguration,
    customnet
);

export const grpcClientAtom = atom<ConcordiumGRPCClient>((get) => {
    const network = get(storedNetworkConfigurationAtom);

    return new ConcordiumGRPCWebClient(network.grpcUrl, network.grpcPort, { timeout: GRPCTIMEOUT });
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
