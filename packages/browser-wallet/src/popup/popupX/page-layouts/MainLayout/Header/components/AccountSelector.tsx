import React from 'react';
import CarretRight from '@assets/svgX/caret-right.svg';
import Form from '@popup/popupX/shared/Form/Form';
import EthLogo from '@assets/svgX/eth-logo.svg';
import DnwLogo from '@assets/svgX/dnw-logo.svg';
import EureLogo from '@assets/svgX/eure-logo.svg';
import BtcLogo from '@assets/svgX/btc-logo.svg';
import ArrowsUpDown from '@assets/svgX/arrows-down-up.svg';
import FormSearch from '@popup/popupX/shared/Form/Search';
import Button from '@popup/popupX/shared/Button';

type Props = { showAccountSelector: boolean };

export default function AccountSelector({ showAccountSelector }: Props) {
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
                                    control={f.control}
                                    name="network"
                                    placeholder="Search by name"
                                    autoFocus
                                    defaultValue="https://whatevertheaddressIs.com"
                                />
                            );
                        }}
                    </Form>
                    <Button.IconText icon={<ArrowsUpDown />} label="Sort A-Z" />
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
