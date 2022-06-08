import { Provider, useAtomValue } from 'jotai';
import React, { ReactElement, Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import { InternalMessageType } from '@concordium/browser-wallet-message-hub';

import { Dimensions, large, medium, small } from '@popup/constants/dimensions';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { isSpawnedWindow } from '@popup/shared/window-helpers';
import { themeAtom } from '@popup/store/settings';
import { Theme as ThemeType } from '@shared/storage/types';
import { noOp } from '@shared/utils/basic-helpers';

import './i18n';

import Routes from './Routes';

const body = document.getElementsByTagName('body').item(0);
const html = document.getElementsByTagName('html').item(0);

function useScaling() {
    useEffect(() => {
        const h = Math.min(window.screen.width, window.screen.height); // Seems to get dimensions for primary display only for the non-spawned popup.

        let dimensions: Dimensions | undefined;

        if (h >= 1080 && h < 1440) {
            dimensions = { ...medium };
            html?.classList.add('ui-scale-medium');
        } else {
            dimensions = { ...large };
            html?.classList.add('ui-scale-large');
        }

        // When opened by clicking on the extension icon
        if (!isSpawnedWindow && html) {
            const { width, height } = dimensions ?? small;

            // Mimic what's done on a spawned popup window in the bg script.
            html.style.width = `${width}px`;
            html.style.height = `${height}px`;
        }

        if (dimensions && isSpawnedWindow) {
            // Send a message to the BG script to resize the window.
            popupMessageHandler.sendInternalMessage(InternalMessageType.SetViewSize, dimensions).catch(noOp);
        }
    }, []);
}

function Theme({ children }: { children: ReactElement }) {
    const theme = useAtomValue(themeAtom);

    useEffect(() => {
        if (theme === ThemeType.Light) {
            body?.classList.remove('dark');
        } else {
            body?.classList.add('dark');
        }
    }, [theme]);

    return children;
}

export default function Root() {
    const { t } = useTranslation();
    useScaling();

    return (
        <Provider>
            <MemoryRouter>
                {/* The Suspense is needed here due to async atoms loading stuff from storage */}
                <Suspense fallback={t('root.loading')}>
                    <Theme>
                        <Routes />
                    </Theme>
                </Suspense>
            </MemoryRouter>
        </Provider>
    );
}
