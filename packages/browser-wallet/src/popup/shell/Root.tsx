import { Provider, useAtom, useAtomValue } from 'jotai';
import React, { ReactElement, useEffect, useMemo } from 'react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { InternalMessageType } from '@messaging';
import { noOp } from 'wallet-common-helpers';

import { Dimensions, large, medium, small } from '@popup/constants/dimensions';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { isFullscreenWindow, isSpawnedWeb3IdProofWindow, isSpawnedWindow } from '@popup/shared/window-helpers';
import { networkConfigurationAtom, themeAtom, uiStyleAtom } from '@popup/store/settings';
import { Theme as ThemeType, UiStyle } from '@shared/storage/types';
import BlockChainParametersContext from '@popup/shared/BlockChainParametersProvider';
import AccountInfoListenerContext from '@popup/shared/AccountInfoListenerContext';

import './i18n';

import { mainnet } from '@shared/constants/networkConfiguration';
import { routePrefix, absoluteRoutes } from '@popup/popupX/constants/routes';
import { MessagePromptHandlersType, useMessagePromptHandlers } from '@popup/shared/utils/message-prompt-handlers';
import Routes from './Routes';
import RoutesX from '../popupX/shell/Routes';

const body = document.getElementsByTagName('body').item(0);
const html = document.getElementsByTagName('html').item(0);

function resetHtmlHeight() {
    if (html) {
        html.style.height = 'auto';
        setTimeout(() => {
            html.style.removeProperty('height');
        });
    }
}

function Scaling({ children }: { children: ReactElement }) {
    const { pathname } = useLocation();
    const h = Math.min(window.screen.width, window.screen.height); // Seems to get dimensions for primary display only for the non-spawned popup.

    const isPopupX = useMemo(() => pathname.includes(routePrefix), [pathname]);

    useEffect(() => {
        if (isPopupX) {
            body?.classList.add('popup-x');
            html?.classList.add('popup-x');
        } else {
            body?.classList.remove('popup-x');
            html?.classList.remove('popup-x');
            resetHtmlHeight();
        }
        // html?.classList.add('tablet');
    }, [isPopupX]);

    useEffect(() => {
        let dimensions: Dimensions | undefined;

        if (h >= 1080 && h < 1440) {
            dimensions = { ...medium };
            html?.classList.add('ui-scale-medium');
        } else {
            dimensions = { ...large };
            html?.classList.add('ui-scale-large');
        }

        if (isPopupX) {
            dimensions = { ...large };
        }

        // When opened by clicking on the extension icon
        if (!isSpawnedWindow && body && html) {
            const { width, height } = dimensions ?? small;

            // Mimic what's done on a spawned popup window in the bg script.
            body.style.width = `${width}px`;
            body.style.height = `${height}px`;

            if (isFullscreenWindow) {
                body.style.margin = '32px auto';
            }
        }

        if (dimensions && isSpawnedWindow) {
            if (isSpawnedWeb3IdProofWindow) {
                dimensions = { width: 440, height: 870 };
            }

            // Send a message to the BG script to resize the window.
            popupMessageHandler.sendInternalMessage(InternalMessageType.SetViewSize, dimensions).catch(noOp);
        }
    }, [body?.classList.length, isPopupX]);

    return children;
}

function Network({ children }: { children: ReactElement }) {
    const network = useAtomValue(networkConfigurationAtom);

    useEffect(() => {
        if (network.name === mainnet.name) {
            body?.classList.add('mainnet');
        } else {
            body?.classList.remove('mainnet');
        }
    }, [network]);

    return children;
}

function Theme({ children }: { children: ReactElement }) {
    const theme = useAtomValue(themeAtom);

    useEffect(() => {
        if (theme === ThemeType.Light) {
            body?.classList.add('light');
            body?.classList.remove('dark');
        } else {
            body?.classList.add('dark');
            body?.classList.remove('light');
        }
    }, [theme]);

    return children;
}

function MessagePromptHandlers({
    children,
}: {
    children: (messagePromptHandlers: MessagePromptHandlersType) => ReactElement;
}) {
    const messagePromptHandlers = useMessagePromptHandlers();
    return children(messagePromptHandlers);
}

export default function Root() {
    const [uiStyle] = useAtom(uiStyleAtom);
    if (uiStyle.loading) return null;

    return (
        <Provider>
            <MemoryRouter initialEntries={[uiStyle.value === UiStyle.Old ? '/account' : absoluteRoutes.settings.earn.delegator.register.path]}>
                <Scaling>
                    <Network>
                        <Theme>
                            <AccountInfoListenerContext>
                                <BlockChainParametersContext>
                                    <MessagePromptHandlers>
                                        {(messagePromptHandlers) => (
                                            <>
                                                <Routes messagePromptHandlers={messagePromptHandlers} />
                                                <RoutesX messagePromptHandlers={messagePromptHandlers} />
                                            </>
                                        )}
                                    </MessagePromptHandlers>
                                </BlockChainParametersContext>
                            </AccountInfoListenerContext>
                        </Theme>
                    </Network>
                </Scaling>
            </MemoryRouter>
        </Provider>
    );
}
