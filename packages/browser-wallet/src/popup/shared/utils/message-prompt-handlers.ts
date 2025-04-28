import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { noOp } from 'wallet-common-helpers';
import { absoluteRoutes } from '@popup/constants/routes';
import { absoluteRoutes as absoluteRoutesX } from '@popup/popupX/constants/routes';
import { createMessageTypeFilter, InternalMessageType, MessageStatusWrapper, MessageType } from '@messaging';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { AccountTransactionSignature, IdProofOutput } from '@concordium/web-sdk';

const html = document.getElementsByTagName('html').item(0);

type PromptKey =
    | keyof Omit<typeof absoluteRoutes['prompt'], 'path'>
    | keyof Omit<typeof absoluteRoutesX['prompt'], 'path' | 'config'>;

const getRouteAndReplace = (pathname: string, promptKey: PromptKey) => {
    const isPopupX = html?.classList.contains('popup-x');

    // ToDo update all routes of absoluteRoutesX.prompt[promptKey]
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    if (isPopupX && absoluteRoutesX.prompt[promptKey]) {
        const replace = pathname.startsWith(absoluteRoutesX.prompt.path); // replace existing prompts.
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const route = absoluteRoutesX.prompt[promptKey]?.path;
        return { route, replace };
    }
    const replace = pathname.startsWith(absoluteRoutes.prompt.path); // replace existing prompts.
    const route = absoluteRoutes.prompt[promptKey].path;
    return { route, replace };
};

function useMessagePrompt<R>(type: InternalMessageType | MessageType, promptKey: PromptKey) {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    const eventResponseRef = useRef<(response: R) => void>();
    const handleResponse = (response: R) => {
        eventResponseRef.current?.(response);
    };

    useEffect(
        () =>
            popupMessageHandler.handleMessage(createMessageTypeFilter(type), (msg, _sender, respond) => {
                eventResponseRef.current = respond;
                const { route, replace } = getRouteAndReplace(pathname, promptKey);

                navigate(route, { state: msg, replace });

                return true;
            }),
        [pathname]
    );

    return handleResponse;
}

/**
 * Used for internal prompt, which does not return responses to the background script
 */
function usePrompt(type: InternalMessageType | MessageType, promptKey: PromptKey) {
    const navigate = useNavigate();
    const { pathname } = useLocation();

    useEffect(
        () =>
            popupMessageHandler.handleMessage(createMessageTypeFilter(type), (msg) => {
                const { route, replace } = getRouteAndReplace(pathname, promptKey);
                navigate(route, { state: msg, replace });
            }),
        [pathname]
    );
}

export type MessagePromptHandlersType = {
    handleConnectionResponse: (response: boolean) => void;
    handleConnectAccountsResponse: (response: MessageStatusWrapper<string[]>) => void;
    handleAddWeb3IdCredentialResponse: (response: MessageStatusWrapper<string>) => void;
    handleSendTransactionResponse: (response: MessageStatusWrapper<string>) => void;
    handleSignMessageResponse: (response: MessageStatusWrapper<AccountTransactionSignature>) => void;
    handleSignCIS3MessageResponse: (response: MessageStatusWrapper<AccountTransactionSignature>) => void;
    handleAddTokensResponse: (response: MessageStatusWrapper<string[]>) => void;
    handleIdProofResponse: (response: MessageStatusWrapper<IdProofOutput>) => void;
    handleWeb3IdProofResponse: (response: MessageStatusWrapper<string>) => void;
    handleAgeProofResponse: (response: MessageStatusWrapper<string>) => void;
};

export function useMessagePromptHandlers(): MessagePromptHandlersType {
    const handleConnectionResponse = useMessagePrompt<boolean>(InternalMessageType.Connect, 'connectionRequest');
    const handleConnectAccountsResponse = useMessagePrompt<MessageStatusWrapper<string[]>>(
        InternalMessageType.ConnectAccounts,
        'connectAccountsRequest'
    );
    const handleAddWeb3IdCredentialResponse = useMessagePrompt<MessageStatusWrapper<string>>(
        InternalMessageType.AddWeb3IdCredential,
        'addWeb3IdCredential'
    );
    const handleSendTransactionResponse = useMessagePrompt<MessageStatusWrapper<string>>(
        InternalMessageType.SendTransaction,
        'sendTransaction'
    );
    const handleSignMessageResponse = useMessagePrompt<MessageStatusWrapper<AccountTransactionSignature>>(
        InternalMessageType.SignMessage,
        'signMessage'
    );
    const handleSignCIS3MessageResponse = useMessagePrompt<MessageStatusWrapper<AccountTransactionSignature>>(
        InternalMessageType.SignCIS3Message,
        'signCIS3Message'
    );
    const handleAddTokensResponse = useMessagePrompt<MessageStatusWrapper<string[]>>(
        InternalMessageType.AddTokens,
        'addTokens'
    );
    const handleIdProofResponse = useMessagePrompt<MessageStatusWrapper<IdProofOutput>>(
        InternalMessageType.IdProof,
        'idProof'
    );

    // We manually stringify the presentation
    const handleWeb3IdProofResponse = useMessagePrompt<MessageStatusWrapper<string>>(
        InternalMessageType.Web3IdProof,
        'web3IdProof'
    );
    const handleAgeProofResponse = useMessagePrompt<MessageStatusWrapper<string>>(
        InternalMessageType.AgeProof,
        'ageProof'
    );

    usePrompt(InternalMessageType.EndIdentityIssuance, 'endIdentityIssuance');
    usePrompt(InternalMessageType.RecoveryFinished, 'recovery');
    usePrompt(InternalMessageType.ImportWeb3IdBackup, 'importWeb3IdBackup');

    useEffect(() => {
        popupMessageHandler.sendInternalMessage(InternalMessageType.PopupReady).catch(noOp);
    }, []);

    return {
        handleConnectionResponse,
        handleConnectAccountsResponse,
        handleAddWeb3IdCredentialResponse,
        handleSendTransactionResponse,
        handleSignMessageResponse,
        handleSignCIS3MessageResponse,
        handleAddTokensResponse,
        handleIdProofResponse,
        handleWeb3IdProofResponse,
        handleAgeProofResponse,
    };
}
