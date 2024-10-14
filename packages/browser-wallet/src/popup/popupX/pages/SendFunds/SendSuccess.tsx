import React from 'react';
import CheckCircle from '@assets/svgX/check-circle.svg';
import Arrow from '@assets/svgX/arrow-right.svg';
import Button from '@popup/popupX/shared/Button';
import { useNavigate } from 'react-router-dom';

export default function SendSuccess() {
    const nav = useNavigate();
    return (
        <div className="send-funds-container">
            <div className="send-funds-success__card">
                <CheckCircle />
                <span className="capture__main_small">You’ve sent</span>
                <span className="heading_large">12,600.00</span>
                <span className="capture__main_small">CCD</span>
            </div>
            <div className="send-funds-success__details">
                <span className="label__regular">Transaction details</span>
                <Arrow />
            </div>
            <Button.Main className="button-main" onClick={() => nav('../../../../home')} label="Return to Account" />
        </div>
    );
}
