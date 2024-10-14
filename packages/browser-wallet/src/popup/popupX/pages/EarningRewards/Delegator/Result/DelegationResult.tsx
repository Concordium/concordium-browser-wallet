import React from 'react';
import Button from '@popup/popupX/shared/Button';

export default function DelegationResult() {
    return (
        <div className="delegation-result-container">
            <div className="delegation-result__title">
                <span className="heading_medium">Register Delegation</span>
                <span className="capture__main_small">on Accout 1 / 6gk...k7o</span>
            </div>
            <span className="capture__main_small">
                This will lock your delegation amount. Amount is released after 14 days from the time you remove or
                decrease your delegation.
            </span>
            <div className="delegation-result__card">
                <div className="delegation-result__card_row">
                    <span className="capture__main_small">Transaction</span>
                    <span className="capture__main_small">Register delegation</span>
                </div>
                <div className="delegation-result__card_row">
                    <span className="capture__main_small">Estimated transaction fee</span>
                    <span className="capture__main_small">1,000.00 CCD</span>
                </div>
                <div className="delegation-result__card_row">
                    <span className="capture__main_small">Transaction hash</span>
                    <span className="capture__main_small">
                        4f84fg3gb6d9s9s3s1d46gg9grf7jmf9xc5c7s5x3vn80b8c6x5x4f84fg3gb6d9s9s3s1d4
                    </span>
                </div>
            </div>
            <Button.Main label="Continue" />
        </div>
    );
}
