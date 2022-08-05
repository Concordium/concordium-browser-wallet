import {
    createMessageTypeFilter,
    ExtensionMessageHandler,
    InternalMessageType,
    MessageType,
} from '@concordium/browser-wallet-message-hub';
import { storedSelectedAccount, storedUrlWhitelist, storedJsonRpcUrl } from '@shared/storage/access';

import { v4 as uuidv4 } from 'uuid';
import bgMessageHandler from './message-handler';
import { forwardToPopup, HandleMessage, HandleResponse, RunCondition, setPopupSize } from './window-management';

// TODO Replace with concordiumSDK HttpProvider when cross-fetch supports service workers. https://github.com/lquixada/cross-fetch/issues/78
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const jsonRpcRequest = async (url: string, method: string, params?: any) => {
    const paramPlaceholder = '____params____';
    const request = {
        method,
        params: params ? paramPlaceholder : undefined,
        id: uuidv4(),
        jsonrpc: '2.0',
    };

    const options = {
        method: 'POST',
        body: JSON.stringify(request).replace(`"${paramPlaceholder}"`, params),
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const res = await fetch(url, options);
    if (res.status >= 400) {
        const json = await res.json();
        if (json.error) {
            throw new Error(`${json.error.code}: ${json.error.message} (id: ${json.id})`);
        } else {
            throw new Error(`${res.status}: ${res.statusText} (id: ${json.id})`);
        }
    }

    return res.text();
};

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

bgMessageHandler.handleMessage(createMessageTypeFilter(InternalMessageType.Init), injectScript);
bgMessageHandler.handleMessage(createMessageTypeFilter(InternalMessageType.SetViewSize), ({ payload }) => {
    setPopupSize(payload);
});

bgMessageHandler.handleMessage(createMessageTypeFilter(MessageType.JsonRpcRequest), (input, _sender, respond) => {
    storedJsonRpcUrl.get().then((url) => {
        if (!url) {
            throw new Error('No Json RPC URL available');
        }
        jsonRpcRequest(url, input.payload.method, input.payload.params).then(respond);
    });
    return true;
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
