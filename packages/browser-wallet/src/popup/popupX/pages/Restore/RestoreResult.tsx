import React from 'react';
import ArrowRight from '@assets/svgX/arrow-right.svg';
import Button from '@popup/popupX/shared/Button';

export default function RestoreResult() {
    return (
        <div className="restore-container">
            <div className="restore-result__title">
                <span className="heading_medium">Restoring result</span>
                <span className="capture__main_small">The following identities and accounts were recovered.</span>
            </div>
            <div className="restore-result__identity-card">
                <span className="text__main">Identity 1</span>
                <span className="capture__additional_small">Verified by NotaBene</span>
                <div className="restore-result__identity-card_details">
                    <div className="details-data-line">
                        <span className="text__main_regular">Accout 1 / 6gk...Fk7o</span>
                        <span className="text__main_medium">4,227.38 USD</span>
                        <ArrowRight />
                    </div>
                    <div className="details-data-line">
                        <span className="text__main_regular">Accout 2 / tt2...50eo</span>
                        <span className="text__main_medium">1,195.41 USD</span>
                        <ArrowRight />
                    </div>
                </div>
            </div>
            <Button.Main className="button-main" onClick={() => {}} label="Continue" />
        </div>
    );
}
