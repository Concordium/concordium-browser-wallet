import React from 'react';
import Arrow from '@assets/svgX/arrow-right.svg';
import Button from '@popup/popupX/shared/Button';
import { useNavigate } from 'react-router-dom';
import { relativeRoutes } from '@popup/popupX/constants/routes';

export default function SendConfirm() {
    const nav = useNavigate();
    const navToConfirmed = () => nav(relativeRoutes.home.send.confirmation.confirmed.path);
    return (
        <div className="send-funds-container">
            <div className="send-funds-confirm__title">
                <span className="heading_medium">Confirmation</span>
            </div>
            <div className="send-funds-confirm__card">
                <div className="send-funds-confirm__card_destination">
                    <span className="text__main_medium">6gk...Fk7o</span>
                    <Arrow />
                    <span className="text__main_medium">bc1q...0wlh</span>
                </div>
                <span className="capture__main_small">Amount (CCD):</span>
                <span className="heading_large">12,600.00</span>
                <span className="capture__main_small">Est. fee: 0.03614 CCD</span>
            </div>

            <Button className="button-main" onClick={() => navToConfirmed()}>
                Send funds
            </Button>
        </div>
    );
}
