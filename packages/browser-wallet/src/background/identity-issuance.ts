import { createIdentityRequest } from '@concordium/web-sdk';
import { IdentityIssuanceBackgroundResponse } from '@shared/utils/identity-helpers';
import { ExtensionMessageHandler, InternalMessageType } from '@concordium/browser-wallet-message-hub';
import { openWindow } from './window-management';

import bgMessageHandler from './message-handler';

const redirectUri = 'ConcordiumRedirectToken';
const codeUriKey = 'code_uri=';

export const identityIssuanceHandler: ExtensionMessageHandler = (msg) => {
    const respond = (response: IdentityIssuanceBackgroundResponse) => {
        openWindow().then(() =>
            bgMessageHandler.sendInternalMessage(InternalMessageType.EndIdentityIssuance, response)
        );
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

    chrome.tabs
        .create({
            url,
        })
        .then((tab) => {
            const closedListener = (tabId: number) => {
                if (tabId === tab.id) {
                    chrome.tabs.onRemoved.removeListener(closedListener);
                    respond({
                        status: 'Aborted',
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
                    status: 'Success',
                    result: redirectUrl.substring(redirectUrl.indexOf(codeUriKey) + codeUriKey.length),
                });
            });
        });
};
