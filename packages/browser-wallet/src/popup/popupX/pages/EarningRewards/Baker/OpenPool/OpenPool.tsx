import React from 'react';
import { ToggleCheckbox } from '@popup/popupX/shared/Form/ToggleCheckbox';
import Button from '@popup/popupX/shared/Button';

export default function OpenPool() {
    return (
        <div className="open-pool-container">
            <div className="open-pool__title">
                <span className="heading_medium">Opening a pool</span>
                <span className="capture__main_small">on Accout 1 / 6gk...k7o</span>
            </div>
            <div className="open-pool__card">
                <div className="open-pool__card_delegation">
                    <span className="text__main">Open for delegation</span>
                    <ToggleCheckbox />
                </div>
                <span className="capture__main_small">
                    You have the option to open your baker as a pool for others to delegate their CCD to.
                </span>
                <span className="capture__main_small">
                    If you choose to open your pool, other people will be able to delegate CCDs to your baking pool.
                </span>
                <span className="capture__main_small">
                    You can also keep the pool closed, if you want only your own CCDs to be stalked.
                </span>
            </div>
            <Button className="button-main">Continue</Button>
        </div>
    );
}
