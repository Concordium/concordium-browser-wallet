import React from 'react';
import { useLocation } from 'react-router-dom';
import { isFullscreenWindow } from '@popup/shared/window-helpers';
import ArrowsOut from '@assets/svgX/UiKit/Arrows/fullscreen-maximize.svg';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { InternalMessageType } from '@messaging';
import { useTranslation } from 'react-i18next';
import Text from '@popup/popupX/shared/Text';

export default function Fullscreen() {
    const { t } = useTranslation('x', { keyPrefix: 'header.fullscreen' });
    const location = useLocation();

    const onClick = () => {
        if (isFullscreenWindow) {
            popupMessageHandler.sendInternalMessage(InternalMessageType.OpenPopup).then(() => {
                window.close();
            });
        } else {
            popupMessageHandler.sendInternalMessage(
                InternalMessageType.OpenFullscreen,
                `?navTo=${location.pathname}&state=${JSON.stringify(location.state)}`
            );
        }
    };

    return (
        <div className="main-header__fullscreen">
            <button type="button" className="main-header__fullscreen_button" onClick={onClick}>
                <Text.UiKit>{t('fullscreen')}</Text.UiKit>
                <ArrowsOut />
            </button>
        </div>
    );
}
