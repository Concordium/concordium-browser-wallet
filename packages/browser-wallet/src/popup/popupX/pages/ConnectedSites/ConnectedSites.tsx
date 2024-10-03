import React from 'react';

export default function ConnectedSites() {
    return (
        <div className="connected-sites-container">
            <div className="connected-sites__title">
                <span className="heading_medium">Connected sites</span>
                <span className="capture__main_small">Accout 1 / 6gk...Fk7o</span>
            </div>
            <div className="connected-sites__card">
                <div className="connected-sites__card_row">
                    <span className="text__main_regular">concordium.com</span>
                    <span className="capture__additional_small">Disconnect</span>
                </div>
                <div className="connected-sites__card_row">
                    <span className="text__main_regular">app.uniswap.org</span>
                    <span className="capture__additional_small">Disconnect</span>
                </div>
                <div className="connected-sites__card_row">
                    <span className="text__main_regular">binance.com</span>
                    <span className="capture__additional_small">Disconnect</span>
                </div>
            </div>
        </div>
    );
}
