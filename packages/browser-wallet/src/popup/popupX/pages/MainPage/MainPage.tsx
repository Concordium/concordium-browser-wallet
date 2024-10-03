import React from 'react';
import { useNavigate } from 'react-router-dom';
import IconButton from '@popup/popupX/shared/IconButton';
import Arrow from '@assets/svgX/arrow-right.svg';
import FileText from '@assets/svgX/file-text.svg';
import EthLogo from '@assets/svgX/eth-logo.svg';
import ConcordiumLogo from '@assets/svgX/concordium-logo.svg';
import Plant from '@assets/svgX/plant.svg';
import DnwLogo from '@assets/svgX/dnw-logo.svg';
import GameController from '@assets/svgX/game-controller.svg';
import EureLogo from '@assets/svgX/eure-logo.svg';
import BtcLogo from '@assets/svgX/btc-logo.svg';
import { relativeRoutes } from '@popup/popupX/constants/routes';

export default function MainPage() {
    const nav = useNavigate();
    const navToSend = () => nav(relativeRoutes.home.send.path);
    const navToReceive = () => nav(relativeRoutes.home.receive.path);
    const navToTransactionLog = () => nav(relativeRoutes.home.transactionLog.path);
    const navToTokenDetails = () => nav(relativeRoutes.home.token.path);

    return (
        <div className="main-page-container">
            <div className="main-page__balance">
                <span className="heading_large">4,227.38 USD</span>
                <span className="capture__main_small">1,285,700 CCD</span>
            </div>
            <div className="main-page__action-buttons">
                <IconButton className="send" onClick={() => navToSend()}>
                    <Arrow />
                    <span className="capture__additional_small">Send</span>
                </IconButton>
                <IconButton className="receive" onClick={() => navToReceive()}>
                    <Arrow />
                    <span className="capture__additional_small">Receive</span>
                </IconButton>
                <IconButton onClick={() => navToTransactionLog()}>
                    <FileText />
                    <span className="capture__additional_small">Transactions</span>
                </IconButton>
            </div>
            <div className="main-page__tokens">
                <div className="main-page__tokens-list">
                    <div className="main-page__tokens-list_item" onClick={() => navToTokenDetails()}>
                        <div className="token-icon">
                            <ConcordiumLogo />
                        </div>
                        <div className="token-balance">
                            <div className="token-balance__amount">
                                <span className="label__main">CCD</span>
                                <Plant />
                                <span className="label__main">600,000</span>
                            </div>
                            <div className="token-balance__exchange-rate">
                                <span className="capture__main_small">$0.003288</span>
                                <span className="capture__main_small">$1972.80</span>
                            </div>
                        </div>
                    </div>
                    <div className="main-page__tokens-list_item" onClick={() => navToTokenDetails()}>
                        <div className="token-icon">
                            <EthLogo />
                        </div>
                        <div className="token-balance">
                            <div className="token-balance__amount">
                                <span className="label__main">ETHb</span>
                                <span className="label__main">110.21</span>
                            </div>
                            <div className="token-balance__exchange-rate">
                                <span className="capture__main_small">$0.1159</span>
                                <span className="capture__main_small">$120.81</span>
                            </div>
                        </div>
                    </div>
                    <div className="main-page__tokens-list_item" onClick={() => navToTokenDetails()}>
                        <div className="token-icon">
                            <DnwLogo />
                        </div>
                        <div className="token-balance">
                            <div className="token-balance__amount">
                                <span className="label__main">DNW</span>
                                <GameController />
                                <span className="label__main">45.90</span>
                            </div>
                        </div>
                    </div>
                    <div className="main-page__tokens-list_item" onClick={() => navToTokenDetails()}>
                        <div className="token-icon">
                            <EureLogo />
                        </div>
                        <div className="token-balance">
                            <div className="token-balance__amount">
                                <span className="label__main">EURe</span>
                                <span className="label__main">120.00</span>
                            </div>
                            <div className="token-balance__exchange-rate">
                                <span className="capture__main_small">$1.08</span>
                                <span className="capture__main_small">$129,75</span>
                            </div>
                        </div>
                    </div>
                    <div className="main-page__tokens-list_item" onClick={() => navToTokenDetails()}>
                        <div className="token-icon">
                            <BtcLogo />
                        </div>
                        <div className="token-balance">
                            <div className="token-balance__amount">
                                <span className="label__main">BTC</span>
                                <span className="label__main">17.64</span>
                            </div>
                            <div className="token-balance__exchange-rate">
                                <span className="capture__main_small">$64000.003288</span>
                                <span className="capture__main_small">$8798573,79</span>
                            </div>
                        </div>
                    </div>
                    <div className="main-page__tokens-list_item" onClick={() => navToTokenDetails()}>
                        <div className="token-icon">
                            <EthLogo />
                        </div>
                        <div className="token-balance">
                            <div className="token-balance__amount">
                                <span className="label__main">ETH</span>
                                <span className="label__main">123</span>
                            </div>
                            <div className="token-balance__exchange-rate">
                                <span className="capture__main_small">$0.003288</span>
                                <span className="capture__main_small">123</span>
                            </div>
                        </div>
                    </div>
                    <div className="main-page__tokens-list_item" onClick={() => navToTokenDetails()}>
                        <div className="token-icon">
                            <EthLogo />
                        </div>
                        <div className="token-balance">
                            <div className="token-balance__amount">
                                <span className="label__main">ETH</span>
                                <span className="label__main">123</span>
                            </div>
                            <div className="token-balance__exchange-rate">
                                <span className="capture__main_small">$0.003288</span>
                                <span className="capture__main_small">123</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
