import {
    createMessageTypeFilter,
    ExtensionMessageHandler,
    InternalMessageType,
    MessageType,
} from '@concordium/browser-wallet-message-hub';
import { storedSelectedAccount, storedUrlWhitelist } from '@shared/storage/access';

import bgMessageHandler from './message-handler';
import {
    forwardToPopup,
    HandleMessage,
    HandleResponse,
    RunCondition,
    setPopupSize,
    openWindow,
} from './window-management';

/**
 * Callback method which installs Injected script into Main world of Dapp
 */
const injectScript: ExtensionMessageHandler = (_msg, sender, respond) => {
    if (sender.tab?.id === undefined) {
        throw new Error('No ID for tab.');
    }

    chrome.scripting
        .executeScript({
            target: { tabId: sender.tab.id },
            // TODO this is a reference to the output file, expecting to be placed in the root with manifest.json.
            // Would be nice if the relative output path could be built from a reference to the entrypoint file instead.
            files: ['inject.js'],
            world: 'MAIN',
        })
        .then(() => respond(true))
        .catch(() => respond(false));

    return true;
};

const redirectUri = 'ConcordiumRedirectToken';
const codeUriKey = 'code_uri=';

type Response =
    | {
          status: 'Success';
          result: string;
      }
    | {
          status: 'Aborted';
      };

const identityIssuance: ExtensionMessageHandler = (msg) => {
    const respond = (response: Response) => {
        openWindow().then(() =>
            bgMessageHandler.sendInternalMessage(InternalMessageType.EndIdentityIssuance, response)
        );
    };

    chrome.tabs
        .create({
            url: msg.payload.url,
        })
        .then((tab) => {
            // TODO: handle the tab being closed.
            const closedListener = (tabId) => {
                if (tabId === tab.id) {
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
                            chrome.webRequest.onBeforeRequest.removeListener(redirectListener);
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
            onComplete.then((url) => {
                chrome.tabs.onRemoved.removeListener(closedListener);
                chrome.tabs.remove(tab.id);
                respond({
                    status: 'Success',
                    result: url.substring(url.indexOf(codeUriKey) + codeUriKey.length),
                });
            });
        });
};

bgMessageHandler.handleMessage(createMessageTypeFilter(InternalMessageType.StartIdentityIssuance), identityIssuance);
bgMessageHandler.handleMessage(createMessageTypeFilter(InternalMessageType.Init), injectScript);
bgMessageHandler.handleMessage(createMessageTypeFilter(InternalMessageType.SetViewSize), ({ payload }) => {
    setPopupSize(payload);
});

/**
 * Run condition which looks up url in stored whitelist. Runs handler if url is included in whitelist.
 */
const runIfWhitelisted: RunCondition<false> = async (_msg, sender) => {
    const whitelist = (await storedUrlWhitelist.get()) ?? [];

    if (sender.url !== undefined && whitelist.includes(sender.url)) {
        return { run: true };
    }

    return { run: false, response: false };
};

/**
 * Run condition which looks up url in stored whitelist. Runs handler if url is NOT included in whitelist.
 */
const runIfNotWhitelisted: RunCondition<string | undefined> = async (_msg, sender) => {
    const whitelist = (await storedUrlWhitelist.get()) ?? [];

    if (!sender.url) {
        throw new Error('Expected url to be available for sender.');
    }

    if (whitelist.includes(sender.url)) {
        const selectedAccount = await storedSelectedAccount.get();
        return { run: false, response: selectedAccount };
    }

    return { run: true };
};

const handleConnectMessage: HandleMessage<{ url: string | undefined; title: string | undefined }> = (
    _,
    { url, tab }
) => ({ url, title: tab?.title });

const handleConnectionResponse: HandleResponse<string | undefined | false> = async (
    response: boolean,
    _msg,
    sender
) => {
    if (!sender.url) {
        throw new Error('Expected url to be available for sender.');
    }

    if (response !== false) {
        const whitelist = (await storedUrlWhitelist.get()) ?? [];
        storedUrlWhitelist.set([...whitelist, sender.url]);

        return storedSelectedAccount.get();
    }

    return response;
};

forwardToPopup(
    MessageType.Connect,
    InternalMessageType.Connect,
    runIfNotWhitelisted,
    handleConnectMessage,
    handleConnectionResponse
);
forwardToPopup(MessageType.SendTransaction, InternalMessageType.SendTransaction, runIfWhitelisted);
forwardToPopup(MessageType.SignMessage, InternalMessageType.SignMessage, runIfWhitelisted);
