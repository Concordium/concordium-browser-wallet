import React from 'react';
import { useLocation } from 'react-router-dom';
import ArrowsOut from '@assets/svgX/arrows-out-simple.svg';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { InternalMessageType } from '@messaging';

export default function Fullscreen() {
    const location = useLocation();

    return (
        <div className="main-header__fullscreen">
            <button
                type="button"
                className="main-header__fullscreen_button"
                onClick={() => {
                    popupMessageHandler.sendInternalMessage(
                        InternalMessageType.OpenFullscreen,
                        `?navTo=${location.pathname}`
                    );
                }}
            >
                <span className="text__additional_small">Fullscreen</span>
                <ArrowsOut />
            </button>
        </div>
    );
}
