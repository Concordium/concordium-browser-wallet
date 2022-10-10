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

const enum MSG { // using const enum here, as typescript compiler replaces uses with the actual underlying string, which we need, because injected functions do not have access to variables declared in the background context
    LIFELINE = 'lifeline',
}

const respond = async (response: IdentityIssuanceBackgroundResponse) => {
    const pendingIdentity = await sessionPendingIdentity.get();
    if (!pendingIdentity) {
        return;
    }

    const { identity, network } = pendingIdentity;
    let { status } = response;

    if (!identity) {
        status = BackgroundResponseStatus.Aborted;
    } else if (response.status === BackgroundResponseStatus.Success) {
        const newIdentity: PendingIdentity = {
            ...identity,
            status: CreationStatus.Pending,
            location: response.result,
        };
        await addIdentity(newIdentity, network.genesisHash);
        confirmIdentity(newIdentity, network.genesisHash);
    }

    sessionPendingIdentity.remove();

    await openWindow();
    bgMessageHandler.sendInternalMessage(InternalMessageType.EndIdentityIssuance, { ...response, status });
};

function addIdpRequestListener() {
    const handleIdpRequest = (redirectUrl: string, tabId: number) => {
        chrome.tabs.remove(tabId);
        sessionIdpTab.remove();

        respond({
            status: BackgroundResponseStatus.Success,
            result: redirectUrl.substring(redirectUrl.indexOf(codeUriKey) + codeUriKey.length),
        });
    };

    chrome.webRequest?.onBeforeRequest.addListener(
        (details) => {
            sessionIdpTab.get().then((idpTabId) => {
                if (details.url.includes(redirectUri) && details.tabId === idpTabId) {
                    handleIdpRequest(details.url, idpTabId);
                }
            });
        },
        { urls: ['<all_urls>'] }
    );
}

export function addIdpListeners() {
    chrome.tabs.onRemoved.addListener(async (tabId: number) => {
        const idpTabId = await sessionIdpTab.get();

        if (idpTabId !== undefined && tabId === idpTabId) {
            sessionIdpTab.remove();
            respond({
                status: BackgroundResponseStatus.Aborted,
            });
        }
    });

    addIdpRequestListener();

    // SAFARI CRASH webrequest API unavailable
    // chrome.webRequest.onBeforeRequest.addListener(
    //     (details) => {
    //         sessionIdpTab.get().then((idpTabId) => {
    //             if (details.url.includes(redirectUri) && details.tabId === idpTabId) {
    //                 handleIdpRequest(details.url, idpTabId);
    //             }
    //         });
    //     },
    //     { urls: ['<all_urls>'] }
    // );

    chrome.runtime.onMessage.addListener((msg, _, sendResponse: (isDone: boolean) => void) => {
        if (msg === MSG.LIFELINE) {
            setTimeout(async () => {
                const pendingIdentity = await sessionPendingIdentity.get();
                sendResponse(pendingIdentity === undefined);
            }, 250e3);

            return true;
        }

        return undefined;
    });
}

const keepAlive = () => {
    function createLifeline() {
        chrome.runtime.sendMessage(MSG.LIFELINE).then((isDone: boolean) => {
            if (!isDone) {
                createLifeline();
            }
        });
    }

    createLifeline();
};

function launchExternalIssuance(url: string) {
    chrome.tabs
        .create({
            url,
        })
        .then((tab) => {
            if (tab.id !== undefined) {
                sessionIdpTab.set(tab.id);

                // This is a hack to keep the service worker running as long as the identity issuance flow
                chrome.scripting.executeScript({
                    target: { tabId: tab.id },
                    func: keepAlive,
                });
            }
        });
}

async function startIdentityIssuance({
    baseUrl,
    ...identityRequestInputs
}: IdentityRequestInput & { baseUrl: string }) {
    const idObjectRequest = createIdentityRequest(identityRequestInputs);

    const params = {
        scope: 'identity',
        response_type: 'code',
        redirect_uri: redirectUri,
        state: JSON.stringify({ idObjectRequest }),
    };
    const searchParams = new URLSearchParams(params);
    const url = Object.entries(params).length === 0 ? baseUrl : `${baseUrl}?${searchParams.toString()}`;
    const network = await storedCurrentNetwork.get();

    if (!network) {
        return;
    }

    try {
        const response = await fetch(url);

        if (!response.ok) {
            respond({
                status: BackgroundResponseStatus.Error,
                reason: (await response.json())?.message || `Provider returned status code ${response.status}.`,
            });
        } else if (!response.redirected) {
            respond({
                status: BackgroundResponseStatus.Error,
                reason: `Initial location did not redirect as expected.`,
            });
        } else {
            launchExternalIssuance(response.url);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        respond({
            status: BackgroundResponseStatus.Error,
            reason: `Failed to reach identity provider due to: ${e.message}`,
        });
    }
}

export const identityIssuanceHandler: ExtensionMessageHandler = (msg) => {
    startIdentityIssuance(msg.payload);
};
