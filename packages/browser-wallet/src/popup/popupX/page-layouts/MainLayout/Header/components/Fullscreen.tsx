import React from 'react';
import { useLocation } from 'react-router-dom';
import { isFullscreenWindow } from '@popup/shared/window-helpers';
import ArrowsOut from '@assets/svgX/arrows-out-simple.svg';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { InternalMessageType } from '@messaging';
import { useTranslation } from 'react-i18next';

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
                <span className="text__additional_small">{t('fullscreen')}</span>
                <ArrowsOut />
            </button>
        </div>
    );
}
