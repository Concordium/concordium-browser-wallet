import React from 'react';
import FormInput from '@popup/popupX/shared/Form/Input';
import CarretRight from '@assets/svgX/caret-right.svg';
import Submit from '@popup/popupX/shared/Form/Submit';
import Form from '@popup/popupX/shared/Form/Form';
import EthLogo from '@assets/svgX/eth-logo.svg';
import DnwLogo from '@assets/svgX/dnw-logo.svg';
import EureLogo from '@assets/svgX/eure-logo.svg';
import BtcLogo from '@assets/svgX/btc-logo.svg';
import IconButton from '@popup/popupX/shared/IconButton';
import ArrowsUpDown from '@assets/svgX/arrows-down-up.svg';
import FormSearch from '@popup/popupX/shared/Form/Search';

export default function AccountSelector({ showAccountSelector }) {
    if (!showAccountSelector) return null;
    return (
        <div className="main-header__account-selector fade-menu-bg">
            <div className="main-header__account-selector_group">
                <div className="main-header__account-selector_search-form">
                    <Form
                        onSubmit={() => {}}
                        // formMethods={}
                        className="account-search__form"
                    >
                        {(f) => {
                            return (
                                <FormSearch
                                    register={f.register}
                                    name="network"
                                    autoFocus
                                    value="https://whatevertheaddressIs.com"
                                />
                            );
                        }}
                    </Form>
                    <IconButton>
                        <ArrowsUpDown />
                        <span className="capture__additional_small">Sort A-Z</span>
                    </IconButton>
                </div>
                <div className="main-header__account-selector_list">
                    <div className="main-header__account-selector_list-item active">
                        <div className="account">
                            <CarretRight />
                            <span className="text__additional_small">Accout 1 / 6gk...k7o</span>
                        </div>
                        <div className="balance">
                            <span className="text__additional_small">1.2M CCD</span>
                        </div>
                        <div className="tokens">
                            <div className="token-icon">
                                <EthLogo />
                            </div>
                            <div className="token-icon">
                                <DnwLogo />
                            </div>
                            <div className="token-icon">
                                <EureLogo />
                            </div>
                            <div className="token-icon">
                                <BtcLogo />
                            </div>
                        </div>
                    </div>
                    <div className="main-header__account-selector_list-item">
                        <div className="account">
                            <CarretRight />
                            <span className="text__additional_small">Accout 2 / 6gk...k7o</span>
                        </div>
                        <div className="balance">
                            <span className="text__additional_small">0.4M CCD</span>
                        </div>
                        <div className="tokens">
                            <div className="token-icon">
                                <EthLogo />
                            </div>
                            <div className="token-icon">
                                <DnwLogo />
                            </div>
                        </div>
                    </div>
                    <div className="main-header__account-selector_list-item">
                        <div className="account">
                            <CarretRight />
                            <span className="text__additional_small">Accout 3 / 6gk...k7o</span>
                        </div>
                        <div className="balance">
                            <span className="text__additional_small">200k CCD</span>
                        </div>
                        <div className="tokens">
                            <div className="token-icon">
                                <EthLogo />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
