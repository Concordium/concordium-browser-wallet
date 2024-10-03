import React from 'react';
import Dot from '@assets/svgX/dot.svg';
import { useNavigate } from 'react-router-dom';
import { relativeRoutes } from '@popup/popupX/constants/routes';

export default function NetworkSettings() {
    const nav = useNavigate();
    const navToConnect = () => nav(relativeRoutes.settings.network.connect.path);
    return (
        <div className="network-settings-container">
            <div className="network-settings__title">
                <span className="heading_medium">Network settings</span>
            </div>
            <div className="network-settings__card">
                <div className="network-settings__card_row">
                    <span className="text__main_regular">Concordium Mainnet</span>
                    <span className="capture__additional_small">
                        <Dot />
                        Connected
                    </span>
                </div>
                <div className="network-settings__card_row" onClick={() => navToConnect()}>
                    <span className="text__main_regular">Concordium Testnet</span>
                    <span className="capture__additional_small">Connect</span>
                </div>
            </div>
        </div>
    );
}
