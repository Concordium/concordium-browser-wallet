import React from 'react';
import Radio from '@popup/popupX/shared/Form/Radios';
import Button from '@popup/popupX/shared/Button';

export default function DelegationType() {
    return (
        <div className="delegation-type-container">
            <div className="delegation-type__title">
                <span className="heading_medium">Register Delegation</span>
            </div>
            <span className="capture__main_small">
                You can delegate to an open pool of your choice, or you can stake using passive delegation.
            </span>
            <div className="delegation-type__select-form">
                <Radio id="baker" label="Baker" name="radio" />
                <Radio id="passive" label="Passive" name="radio" />
            </div>
            <span className="capture__main_small">
                Passive delegation is an alternative to delegation to a specific baker pool that has lower rewards. With
                passive delegation you do not have to worry about the uptime or quality of a baker node.
            </span>
            <span className="capture__main_small">For more info you can visit developer.concordium.software</span>
            <Button.Main label="Continue" />
        </div>
    );
}
