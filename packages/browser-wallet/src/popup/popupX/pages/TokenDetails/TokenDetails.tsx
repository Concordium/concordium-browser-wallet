import React from 'react';
import { useNavigate } from 'react-router-dom';
import IconButton from '@popup/popupX/shared/IconButton';
import Arrow from '@assets/svgX/arrow-right.svg';
import FileText from '@assets/svgX/file-text.svg';
import Plant from '@assets/svgX/plant.svg';
import ConcordiumLogo from '@assets/svgX/concordium-logo.svg';
import Notebook from '@assets/svgX/notebook.svg';
import Eye from '@assets/svgX/eye-slash.svg';
import { relativeRoutes } from '@popup/popupX/constants/routes';

export default function TokenDetails() {
    const nav = useNavigate();
    const navToSend = () => nav(`../${relativeRoutes.home.send.path}`);
    const navToReceive = () => nav(`../${relativeRoutes.home.receive.path}`);
    const navToTransactionLog = () => nav(`../${relativeRoutes.home.transactionLog.path}`);
    return (
        <div className="token-details-container">
            <div className="token-details__selected-token">
                <div className="token-icon">
                    <ConcordiumLogo />
                </div>
                <div className="token-info">
                    <span className="text__main">CCD</span>
                    <span className="capture__main_small">Accout 1 / 6gk...Fk7o</span>
                </div>
            </div>
            <div className="token-details__balance">
                <span className="heading_large">600,000.00</span>
                <span className="capture__main_small">$1972.80</span>
                <div className="staked">
                    <Plant />
                    <span className="capture__additional_small">1000.00 CCD Staked</span>
                </div>
            </div>

            <div className="token-details__action-buttons">
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
            <div className="token-details__card">
                <div className="token-details__card_row">
                    <span className="capture__main_small">Price</span>
                    <div className="stock">
                        <span className="capture__main_small">$0.00296610</span>
                        <span className="capture__main_small change"> (+0.33%)</span>
                    </div>
                </div>
                <div className="token-details__card_row">
                    <span className="capture__main_small">Market Cap</span>
                    <span className="capture__main_small">$28,619,978</span>
                </div>
                <div className="token-details__card_row">
                    <span className="capture__main_small">Description</span>
                    <span className="capture__main_small">
                        CCD is the native token of the Concordium blockchain. Its main use cases are the payment of
                        transaction fees, the payment for the execution of smart contracts, payments between users,
                        payments for commercial transactions, staking, and the rewards offered to node operators.
                    </span>
                </div>
                <div className="token-details__card_row">
                    <span className="capture__main_small">Decimals</span>
                    <span className="capture__main_small">0 - 6</span>
                </div>
                <div className="token-details__card_row">
                    <span className="capture__main_small">Contract index, subindex</span>
                    <span className="capture__main_small">9913, 1</span>
                </div>
            </div>
            <div className="token-details__action-buttons_secondary">
                <IconButton className="metadata">
                    <Notebook />
                    <span className="capture__additional_small">Show raw metadata</span>
                </IconButton>
                <IconButton className="hide-token">
                    <Eye />
                    <span className="capture__additional_small">Hide token from account</span>
                </IconButton>
            </div>
        </div>
    );
}
