import React from 'react';
import Plus from '@assets/svgX/plus.svg';
import Button from '@popup/popupX/shared/Button';
import IconButton from '@popup/popupX/shared/IconButton';

export default function IdCards() {
    return (
        <div className="id-cards-container">
            <div className="id-cards__title">
                <span className="heading_medium">ID Cards</span>
                <IconButton>
                    <Plus />
                </IconButton>
            </div>
            <div className="id-cards__identity-card">
                <div className="id-cards__identity-card_heading">
                    <span className="text__main">Identity 1</span>
                    <Button className="button-secondary">Edit name</Button>
                </div>
                <span className="capture__additional_small verifier">Verified by NotaBene</span>
                <div className="id-cards__identity-card_document">
                    <div className="details-data-line">
                        <span className="text__main_regular">Identity document type</span>
                        <span className="text__main_medium">Drivers licence</span>
                    </div>
                    <div className="details-data-line">
                        <span className="text__main_regular">Identity document number</span>
                        <span className="text__main_medium">BXM680515</span>
                    </div>
                    <div className="details-data-line">
                        <span className="text__main_regular">First name</span>
                        <span className="text__main_medium">Lewis</span>
                    </div>
                    <div className="details-data-line">
                        <span className="text__main_regular">Last name</span>
                        <span className="text__main_medium">Hamilton</span>
                    </div>
                    <div className="details-data-line">
                        <span className="text__main_regular">Date of birth</span>
                        <span className="text__main_medium">13 August 1992</span>
                    </div>
                    <div className="details-data-line">
                        <span className="text__main_regular">Identity document issuer</span>
                        <span className="text__main_medium">New Zeland</span>
                    </div>
                    <div className="details-data-line">
                        <span className="text__main_regular">ID valid until</span>
                        <span className="text__main_medium">30 October 2051</span>
                    </div>
                </div>
                <div className="id-cards__identity-card_accounts">
                    <div className="details-data-line">
                        <span className="text__main_regular">Accout 1 / 6gk...Fk7o</span>
                        <span className="text__main_medium">4,227.38 USD</span>
                    </div>
                    <div className="details-data-line">
                        <span className="text__main_regular">Accout 2 / tt2...50eo</span>
                        <span className="text__main_medium">1,195.41 USD</span>
                    </div>
                    <div className="details-data-line">
                        <span className="text__main_regular">Accout 3 / bnh...JJ76</span>
                        <span className="text__main_medium">123.38 USD</span>
                    </div>
                    <div className="details-data-line">
                        <span className="text__main_regular">Accout 4 / rijf...8h7T</span>
                        <span className="text__main_medium">7,200.41 USD</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
