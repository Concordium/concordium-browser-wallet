import { createIdentityRequest, IdentityRequestInput } from '@concordium/web-sdk';
import { IdentityIssuanceBackgroundResponse } from '@shared/utils/identity-helpers';
import { ExtensionMessageHandler, InternalMessageType } from '@concordium/browser-wallet-message-hub';
import { BackgroundResponseStatus } from '@shared/utils/types';
import { sessionIdpTab, sessionPendingIdentity, storedCurrentNetwork } from '@shared/storage/access';
import { CreationStatus, PendingIdentity } from '@shared/storage/types';
import { buildURLwithSearchParameters } from '@shared/utils/url-helpers';
import { openWindow } from './window-management';

import bgMessageHandler from './message-handler';
import { addIdentity } from './update';
import { confirmIdentity } from './confirmation';

const redirectUri = 'ConcordiumRedirectToken';
const codeUriKey = 'code_uri=';
const errorKey = 'error=';

const enum MSG { // using const enum here, as typescript compiler replaces uses with the actual underlying string, which we need, because injected functions do not have access to variables declared in the background context
    LIFELINE = 'lifeline',
}

const isIdpResponse = (details: chrome.webRequest.WebRequestBodyDetails, idpTabId?: number) =>
    details.url.includes(`${redirectUri}#${codeUriKey}`) && details.tabId === idpTabId;
const isIdpError = (details: chrome.webRequest.WebRequestBodyDetails) =>
    details.url.includes(`${redirectUri}#${errorKey}`) && details.tabId === -1;

/**
 * Send a response to the popup thread that ends the identity issuance flow.
 */
const respondPopup = async (response: IdentityIssuanceBackgroundResponse) => {
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

export function addIdpListeners() {
    chrome.tabs.onRemoved.addListener(async (tabId: number) => {
        const idpTabId = await sessionIdpTab.get();

        if (idpTabId !== undefined && tabId === idpTabId) {
            sessionIdpTab.remove();
            respondPopup({
                status: BackgroundResponseStatus.Aborted,
            });
        }
    });

    const handleIdpResponse = (redirectUrl: string, tabId?: number) => {
        if (tabId !== undefined && tabId > -1) {
            chrome.tabs.remove(tabId);
            sessionIdpTab.remove();
        }

        respondPopup({
            status: BackgroundResponseStatus.Success,
            result: redirectUrl.substring(redirectUrl.indexOf(codeUriKey) + codeUriKey.length),
        });
    };

    const handleIdpError = (redirectUrl: string) => {
        const error = decodeURIComponent(redirectUrl.substring(redirectUrl.indexOf(errorKey) + errorKey.length));
        let message;
        try {
            message = JSON.parse(error).error.detail;
        } catch {
            message = error;
        }

        respondPopup({
            status: BackgroundResponseStatus.Error,
            reason: message,
        });
    };

    chrome.webRequest.onBeforeRequest.addListener(
        (details) => {
            sessionIdpTab.get().then((idpTabId) => {
                if (isIdpResponse(details, idpTabId)) {
                    handleIdpResponse(details.url, idpTabId);
                } else if (isIdpError(details)) {
                    handleIdpError(details.url);
                }
            });
        },
        { urls: ['<all_urls>'] }
    );

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
    const url = buildURLwithSearchParameters(baseUrl, params);
    const network = await storedCurrentNetwork.get();

    if (!network) {
        throw new Error('Unable to get current network');
    }

    try {
        const response = await fetch(url);
        if (!response.redirected) {
            respondPopup({
                status: BackgroundResponseStatus.Error,
                reason: `Initial location did not redirect as expected.`,
            });
        } else if (!response.url.includes(redirectUri)) {
            launchExternalIssuance(response.url);
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
        respondPopup({
            status: BackgroundResponseStatus.Error,
            reason: `Failed to reach identity provider due to: ${e.message}`,
        });
    }
}

export const identityIssuanceHandler: ExtensionMessageHandler = (msg, _sender, respond) => {
    startIdentityIssuance(msg.payload)
        .then(() => respond(true))
        .catch(() => respond(false));
    return true;
};
