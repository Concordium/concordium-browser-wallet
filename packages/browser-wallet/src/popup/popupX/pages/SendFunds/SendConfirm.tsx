import React from 'react';
import Arrow from '@assets/svgX/arrow-right.svg';
import Button from '@popup/popupX/shared/Button';
import { useNavigate } from 'react-router-dom';
import { submittedTransactionRoute } from '@popup/popupX/constants/routes';
import { TransactionHash } from '@concordium/web-sdk';

export default function SendConfirm() {
    const nav = useNavigate();
    // TODO:
    // 1. Submit transaction (see `Delegator/TransactionFlow`)
    // 2. Pass the transaction hash to the route function below
    const navToConfirmed = () => nav(submittedTransactionRoute(TransactionHash.fromHexString('..')));
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

            <Button.Main className="button-main" onClick={() => navToConfirmed()} label="Send funds" />
        </div>
    );
}