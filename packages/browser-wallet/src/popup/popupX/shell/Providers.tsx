import { ReactElement, useEffect } from 'react';
import { useAtomValue } from 'jotai';
import { networkConfigurationAtom, themeAtom } from '@popup/store/settings';
import { mainnet } from '@shared/constants/networkConfiguration';
import { Dimensions, large, medium, small } from '@popup/constants/dimensions';
import {
    isFullscreenWindow,
    isFullscreenWindowDemo,
    isSpawnedWeb3IdProofWindow,
    isSpawnedWindow,
} from '@popup/shared/window-helpers';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { InternalMessageType } from '@messaging';
import { noOp } from 'wallet-common-helpers';
import { Theme as ThemeType } from '@shared/storage/types';

const body = document.getElementsByTagName('body').item(0);
const html = document.getElementsByTagName('html').item(0);
body?.classList.add('popup-x');

export function Scaling({ children }: { children: ReactElement }) {
    useEffect(() => {
        const h = 1500; // Seems to get dimensions for primary display only for the non-spawned popup.

        let dimensions: Dimensions | undefined;

        if (h >= 1080 && h < 1440) {
            dimensions = { ...medium };
            html?.classList.add('ui-scale-medium');
        } else {
            dimensions = { ...large };
            html?.classList.add('ui-scale-large');
        }

        // When opened by clicking on the extension icon
        if (!isSpawnedWindow && body) {
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

        if (isFullscreenWindowDemo && body) {
            body.style.margin = 'unset';
            body.style.width = '100%';
            body.style.height = '100%';
            html?.classList.add('tablet');
        }
    }, []);

    return children;
}

export function Network({ children }: { children: ReactElement }) {
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

export function Theme({ children }: { children: ReactElement }) {
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
