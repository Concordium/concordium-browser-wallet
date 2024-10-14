import React from 'react';
import ConcordiumLogo from '@assets/svgX/concordium-logo.svg';
import Plus from '@assets/svgX/plus.svg';
import SideArrow from '@assets/svgX/side-arrow.svg';
import Button from '@popup/popupX/shared/Button';
import { useNavigate } from 'react-router-dom';
import { relativeRoutes } from '@popup/popupX/constants/routes';

export default function SendFunds() {
    const nav = useNavigate();
    const navToConfirm = () => nav(relativeRoutes.home.send.confirmation.path);
    return (
        <div className="send-funds-container">
            <div className="send-funds__title">
                <span className="heading_medium">Send funds</span>
                <span className="capture__main_small">from Account 1 / 6gk...Fk7o</span>
            </div>
            <div className="send-funds__card">
                <div className="send-funds__card_token">
                    <span className="text__main_medium">Token</span>
                    <div className="token-selector">
                        <div className="token-icon">
                            <ConcordiumLogo />
                        </div>
                        <span className="text__main">CCD</span>
                        <SideArrow />
                        <span className="text__additional_small">17,800 CCD available</span>
                    </div>
                </div>
                <div className="send-funds__card_amount">
                    <span className="text__main_medium">Amount</span>
                    <div className="amount-selector">
                        <span className="heading_big">12,600.00</span>
                        <span className="capture__additional_small">Send max.</span>
                    </div>
                    <span className="capture__main_small">Estimated transaction fee: 0.03614 CCD</span>
                </div>
                <div className="send-funds__card_receiver">
                    <span className="text__main_medium">Receiver address</span>
                    <div className="address-selector">
                        <span className="text__main">bc1qxy2kgdygq2...0wlh</span>
                        <span className="capture__additional_small">Address Book</span>
                    </div>
                </div>
            </div>
            <div className="send-funds__memo">
                <Plus />
                <span className="label__main">Add memo</span>
            </div>
            <Button.Main className="button-main" onClick={() => navToConfirm()} label="Continue" />
        </div>
    );
}
