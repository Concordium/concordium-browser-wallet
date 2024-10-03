import React from 'react';
import ArrowsOut from '@assets/svgX/arrows-out-simple.svg';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { InternalMessageType } from '@messaging';

export default function Fullscreen() {
    return (
        <div className="main-header__fullscreen">
            <button
                type="button"
                className="main-header__fullscreen_button"
                onClick={() => {
                    popupMessageHandler.sendInternalMessage(InternalMessageType.OpenFullscreen);
                }}
            >
                <span className="text__additional_small">Fullscreen</span>
                <ArrowsOut />
            </button>
        </div>
    );
}
