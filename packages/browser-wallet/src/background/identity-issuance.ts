import { createIdentityRequest, IdentityRequestInput } from '@concordium/web-sdk';
import { IdentityIssuanceBackgroundResponse } from '@shared/utils/identity-helpers';
import { ExtensionMessageHandler, InternalMessageType } from '@concordium/browser-wallet-message-hub';
import { BackgroundResponseStatus } from '@shared/utils/types';
import { sessionIdpTab, sessionPendingIdentity, storedCurrentNetwork } from '@shared/storage/access';
import { CreationStatus, PendingIdentity } from '@shared/storage/types';
import { openWindow } from './window-management';

import bgMessageHandler from './message-handler';
import { addIdentity } from './update';
import { confirmIdentity } from './confirmation';

const redirectUri = 'ConcordiumRedirectToken';
const codeUriKey = 'code_uri=';
const IDP_ALARM_NAME = 'idp';

const respond = async (response: IdentityIssuanceBackgroundResponse) => {
    // TODO this hack is only needed due to a bug in chrome, which prevents chrome.webRequest hooks from waking up the service worker from inactive state.
    // Bug will be fixed in chrome v107
    // https://bugs.chromium.org/p/chromium/issues/detail?id=1024211#c73
    chrome.alarms.clear(IDP_ALARM_NAME);

    const network = await storedCurrentNetwork.get();
    if (!network) {
        return;
    }

    let { status } = response;
    const pending = await sessionPendingIdentity.get();

    if (!pending) {
        status = BackgroundResponseStatus.Aborted;
    } else {
        if (response.status === BackgroundResponseStatus.Success) {
            const newIdentity: PendingIdentity = {
                ...pending,
                status: CreationStatus.Pending,
                location: response.result,
            };
            await addIdentity(newIdentity, network.genesisHash);
            confirmIdentity(newIdentity, network.genesisHash);
        }
        await sessionPendingIdentity.remove();
    }

    await openWindow();
    bgMessageHandler.sendInternalMessage(InternalMessageType.EndIdentityIssuance, { ...response, status });
};

export function addIdpListeners() {
    chrome.tabs.onRemoved.addListener(async (tabId: number) => {
        const idpTabId = await sessionIdpTab.get();

        if (idpTabId !== undefined && tabId === idpTabId) {
            respond({
                status: BackgroundResponseStatus.Aborted,
            });
        }
    });

    const handleIdpRequest = (redirectUrl: string, tabId: number) => {
        chrome.tabs.remove(tabId);
        sessionIdpTab.remove();

        respond({
            status: BackgroundResponseStatus.Success,
            result: redirectUrl.substring(redirectUrl.indexOf(codeUriKey) + codeUriKey.length),
        });
    };

    chrome.webRequest.onBeforeRequest.addListener(
        (details) => {
            sessionIdpTab.get().then((idpTabId) => {
                if (details.url.includes(redirectUri) && details.tabId === idpTabId) {
                    handleIdpRequest(details.url, idpTabId);
                }
            });
        },
        { urls: ['<all_urls>'] }
    );

    // TODO this hack is only needed due to a bug in chrome, which prevents chrome.webRequest hooks from waking up the service worker from inactive state.
    // Bug will be fixed in chrome v107
    // https://bugs.chromium.org/p/chromium/issues/detail?id=1024211#c73
    chrome.alarms.onAlarm.addListener(() => {
        /* No-op, to keep script alive while IDP session is ongoing */
    });
}

function launchExternalIssuance(url: string) {
    chrome.tabs
        .create({
            url,
        })
        .then((tab) => {
            // TODO this hack is only needed due to a bug in chrome, which prevents chrome.webRequest hooks from waking up the service worker from inactive state.
            // Bug will be fixed in chrome v107
            // https://bugs.chromium.org/p/chromium/issues/detail?id=1024211#c73
            chrome.alarms.create(IDP_ALARM_NAME, { periodInMinutes: 4.9 });

            if (tab.id !== undefined) {
                sessionIdpTab.set(tab.id);
            }
        });
}

function startIdentityIssuance({ baseUrl, ...identityRequestInputs }: IdentityRequestInput & { baseUrl: string }) {
    const idObjectRequest = createIdentityRequest(identityRequestInputs);

    const params = {
        scope: 'identity',
        response_type: 'code',
        redirect_uri: redirectUri,
        state: JSON.stringify({ idObjectRequest }),
    };
    const searchParams = new URLSearchParams(params);
    const url = Object.entries(params).length === 0 ? baseUrl : `${baseUrl}?${searchParams.toString()}`;

    fetch(url)
        .then((response) => {
            if (!response.ok) {
                response.json().then((body) =>
                    respond({
                        status: BackgroundResponseStatus.Error,
                        reason: body?.message || `Provider returned status code ${response.status}.`,
                    })
                );
            } else if (!response.redirected) {
                respond({
                    status: BackgroundResponseStatus.Error,
                    reason: `Initial location did not redirect as expected.`,
                });
            } else {
                launchExternalIssuance(response.url);
            }
        })
        .catch((e) =>
            respond({
                status: BackgroundResponseStatus.Error,
                reason: `Failed to reach identity provider due to: ${e.message}`,
            })
        );
}

export const identityIssuanceHandler: ExtensionMessageHandler = (msg) => {
    startIdentityIssuance(msg.payload);
};
