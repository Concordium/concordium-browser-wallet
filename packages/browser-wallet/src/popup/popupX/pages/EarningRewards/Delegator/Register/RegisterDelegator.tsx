import React from 'react';
import Button from '@popup/popupX/shared/Button';
import { ToggleCheckbox } from '@popup/popupX/shared/Form/ToggleCheckbox';

export default function RegisterDelegator() {
    return (
        <div className="register-delegator-container">
            <div className="register-delegator__title">
                <span className="heading_medium">Register Delegation</span>
                <span className="capture__main_small">on Accout 1 / 6gk...k7o</span>
            </div>
            <div className="register-delegator__token-card">
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
                    <span className="capture__main_small"> 1,000.00 CCD</span>
                </div>
            </div>
            <div className="register-delegator__pool-info">
                <div className="register-delegator__pool-info_row">
                    <span className="capture__main_small">Current pool</span>
                    <span className="capture__main_small">300,000.00 CCD</span>
                </div>
                <div className="register-delegator__pool-info_row">
                    <span className="capture__main_small">Pool limit</span>
                    <span className="capture__main_small">56,400.66 CCD</span>
                </div>
            </div>
            <div className="register-delegator__reward">
                <div className="register-delegator__reward_auto-add">
                    <span className="text__main">Auto add rewards</span>
                    <ToggleCheckbox />
                </div>
                <span className="capture__main_small">
                    I want to automatically add my baking rewards to my baker stake
                </span>
            </div>
            <Button.Main label="Continue" />
        </div>
    );
}
