import { createIdentityRequest } from '@concordium/web-sdk';
import { IdentityIssuanceBackgroundResponse } from '@shared/utils/identity-helpers';
import { ExtensionMessageHandler, InternalMessageType } from '@concordium/browser-wallet-message-hub';
import { BackgroundResponseStatus } from '@shared/utils/types';
import { sessionPendingIdentity } from '@shared/storage/access';
import { CreationStatus, PendingIdentity } from '@shared/storage/types';
import { openWindow } from './window-management';

import bgMessageHandler from './message-handler';
import { addIdentity } from './update';
import { confirmIdentity } from './confirmation';

const redirectUri = 'ConcordiumRedirectToken';
const codeUriKey = 'code_uri=';

function handleExternalIssuance(url: string, respond: (response: IdentityIssuanceBackgroundResponse) => void) {
    chrome.tabs
        .create({
            url,
        })
        .then((tab) => {
            const closedListener = (tabId: number) => {
                if (tabId === tab.id) {
                    chrome.tabs.onRemoved.removeListener(closedListener);
                    respond({
                        status: BackgroundResponseStatus.Aborted,
                    });
                }
            };
            chrome.tabs.onRemoved.addListener(closedListener);

            const onComplete = new Promise<string>((resolve) => {
                chrome.webRequest.onBeforeRedirect.addListener(
                    function redirectListener(details) {
                        if (details.redirectUrl.includes(redirectUri)) {
                            chrome.webRequest.onBeforeRedirect.removeListener(redirectListener);
                            resolve(details.redirectUrl);
                        }
                    },
                    { urls: ['<all_urls>'], tabId: tab.id }
                );
                chrome.webRequest.onBeforeRequest.addListener(
                    function requestListener(details) {
                        if (details.url.includes(redirectUri)) {
                            chrome.webRequest.onBeforeRequest.removeListener(requestListener);
                            resolve(details.url);
                        }
                    },
                    { urls: ['<all_urls>'], tabId: tab.id }
                );
            });
            onComplete.then((redirectUrl) => {
                chrome.tabs.onRemoved.removeListener(closedListener);
                if (tab.id !== undefined) {
                    chrome.tabs.remove(tab.id);
                }
                respond({
                    status: BackgroundResponseStatus.Success,
                    result: redirectUrl.substring(redirectUrl.indexOf(codeUriKey) + codeUriKey.length),
                });
            });
        });
}

export const identityIssuanceHandler: ExtensionMessageHandler = (msg) => {
    const respond = async (response: IdentityIssuanceBackgroundResponse) => {
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
                await addIdentity(newIdentity);
                confirmIdentity(newIdentity);
            }
            await sessionPendingIdentity.remove();
        }
        await openWindow();
        bgMessageHandler.sendInternalMessage(InternalMessageType.EndIdentityIssuance, { ...response, status });
    };

    const { baseUrl, ...identityRequestInputs } = msg.payload;
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
                handleExternalIssuance(response.url, respond);
            }
        })
        .catch((e) =>
            respond({
                status: BackgroundResponseStatus.Error,
                reason: `Failed to reach identity provider due to: ${e.message}`,
            })
        );
};
