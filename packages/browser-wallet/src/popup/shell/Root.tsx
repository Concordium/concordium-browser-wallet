import { Dimensions, large, medium } from '@popup/constants/dimensions';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { isSpawnedWindow } from '@popup/shared/window-helpers';
import { themeAtom } from '@popup/store/settings';
import { Theme as ThemeType } from '@shared/storage/types';
import { Provider, useAtomValue } from 'jotai';
import React, { PropsWithChildren, Suspense, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { MemoryRouter } from 'react-router-dom';
import { InternalMessageType } from '@concordium/browser-wallet-message-hub';
import { noOp } from '@shared/utils/basic-helpers';

import './i18n';

import Routes from './Routes';

const body = document.getElementsByTagName('body').item(0);
const html = document.getElementsByTagName('html').item(0);

function Theme({ children }: PropsWithChildren<unknown>) {
    const theme = useAtomValue(themeAtom);

    useEffect(() => {
        if (theme === ThemeType.Light) {
            body?.classList.remove('dark');
        } else {
            body?.classList.add('dark');
        }
    }, [theme]);

    useEffect(() => {
        const h = Math.min(window.screen.width, window.screen.height); // Seems to get dimensions for primary display only for the non-spawned popup.

        let dimensions: Dimensions | undefined;
        let cls: string | undefined;

        if (h >= 1080 && h < 1440) {
            dimensions = { ...medium };
            cls = 'ui-scale-medium';
        } else {
            dimensions = { ...large };
            cls = 'ui-scale-large';
        }

        if (cls) {
            html?.classList.add(cls);
        }

        if (isSpawnedWindow) {
            html?.classList.add('spawned-window');
        }

        if (dimensions) {
            popupMessageHandler.sendInternalMessage(InternalMessageType.SetViewSize, dimensions).catch(noOp);
        }
    }, []);

    // eslint-disable-next-line react/jsx-no-useless-fragment
    return <>{children}</>;
}

export default function Root() {
    const { t } = useTranslation();

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
