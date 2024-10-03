import React from 'react';
import Button from '@popup/popupX/shared/Button';
import { ToggleCheckbox } from '@popup/popupX/shared/Form/ToggleCheckbox';

export default function RegisterBaker() {
    return (
        <div className="register-baker-container">
            <div className="register-baker__title">
                <span className="heading_medium">Register Baker</span>
                <span className="capture__main_small">on Accout 1 / 6gk...k7o</span>
            </div>
            <div className="register-baker__token-card">
                <div className="token">
                    <span className="text__main_regular">Token</span>
                    <div className="token-available">
                        <span className="text__main_regular">CCD</span>
                        <span className="text__main_small">17,800 CCD available</span>
                    </div>
                </div>
                <div className="amount">
                    <span className="text__main_regular">Amount</span>
                    <div className="amount-selected">
                        <span className="heading_big">12,600.00</span>
                        <span className="capture__additional_small">Stake max.</span>
                    </div>
                </div>
                <div className="estimated-fee">
                    <span className="capture__main_small">Estimated transaction fee:</span>
                    <span className="capture__main_small"> 12.200,29 CCD – 18.500,04 CCD</span>
                </div>
            </div>
            <div className="register-baker__reward">
                <div className="register-baker__reward_auto-add">
                    <span className="text__main">Auto add rewards</span>
                    <ToggleCheckbox />
                </div>
                <span className="capture__main_small">
                    Set to automatically add baking rewards to baker stake. amounts will be at disposal on your account
                    balance at each pay day.
                </span>
            </div>
            <Button className="button-main">Continue</Button>
        </div>
    );
}
