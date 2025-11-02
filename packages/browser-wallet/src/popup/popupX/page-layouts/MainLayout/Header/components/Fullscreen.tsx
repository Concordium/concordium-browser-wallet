import React from 'react';
import { useLocation } from 'react-router-dom';
import { isFullscreenWindow } from '@popup/shared/window-helpers';
// import ArrowsOut from '@assets/svgX/arrows-out-simple.svg';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { InternalMessageType } from '@messaging';
import { useTranslation } from 'react-i18next';

function FullscreenIcon() {
    // Simple fullscreen SVG icon (replace with your own if you prefer)
    return (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <g clipPath="url(#clip0_3127_1164)">
                <path
                    d="M7.5 0C7.22386 0 7 0.223858 7 0.5C7 0.776142 7.22386 1 7.5 1H10.2929L7.14645 4.14645C6.95118 4.34171 6.95118 4.65829 7.14645 4.85355C7.34171 5.04882 7.65829 5.04882 7.85355 4.85355L11 1.70711V4.5C11 4.77614 11.2239 5 11.5 5C11.7761 5 12 4.77614 12 4.5V0.5C12 0.223858 11.7761 0 11.5 0H7.5Z"
                    fill="#959EA3"
                />
                <path
                    d="M4.14645 7.14645C4.34171 6.95118 4.65829 6.95118 4.85355 7.14645C5.04882 7.34171 5.04882 7.65829 4.85355 7.85355L1.70711 11H4.5C4.77614 11 5 11.2239 5 11.5C5 11.7761 4.77614 12 4.5 12H0.5C0.223858 12 0 11.7761 0 11.5V7.5C0 7.22386 0.223858 7 0.5 7C0.776142 7 1 7.22386 1 7.5V10.2929L4.14645 7.14645Z"
                    fill="#959EA3"
                />
            </g>
            <defs>
                <clipPath id="clip0_3127_1164">
                    <rect width="12" height="12" fill="white" />
                </clipPath>
            </defs>
        </svg>
    );
}

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
            <button
                type="button"
                onClick={onClick}
                style={{
                    background: '#111',
                    border: '1px solid #e5e5e5',
                    borderRadius: 10,
                    color: '#fff',
                    padding: '8px 16px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    cursor: 'pointer',
                }}
            >
                <span style={{ color: '#e5e5e5', fontWeight: 500 }}>{t('fullscreen')}</span>
                <FullscreenIcon />
            </button>
        </div>
        // <div className="main-header__fullscreen">
        //     <button type="button" className="main-header__fullscreen_button" onClick={onClick}>
        //         <span className="text__additional_small">{t('fullscreen')}</span>
        //         <ArrowsOut />
        //     </button>
        // </div>
    );
}
