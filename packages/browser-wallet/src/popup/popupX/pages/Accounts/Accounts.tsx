import React from 'react';
import { useNavigate } from 'react-router-dom';
import Plus from '@assets/svgX/plus.svg';
import Arrows from '@assets/svgX/arrows-down-up.svg';
import MagnifyingGlass from '@assets/svgX/magnifying-glass.svg';
import Pencil from '@assets/svgX/pencil-simple.svg';
import Copy from '@assets/svgX/copy.svg';
import ArrowRight from '@assets/svgX/arrow-right.svg';
import IconButton from '@popup/popupX/shared/IconButton';
import { relativeRoutes } from '@popup/popupX/constants/routes';

export default function Accounts() {
    const nav = useNavigate();
    const navToConnect = () => nav(relativeRoutes.settings.accounts.connectedSites.path);
    return (
        <div className="accounts-container">
            <div className="accounts__title">
                <span className="heading_medium">Accounts</span>
                <IconButton>
                    <Arrows />
                </IconButton>
                <IconButton>
                    <MagnifyingGlass />
                </IconButton>
                <IconButton>
                    <Plus />
                </IconButton>
            </div>
            <div className="accounts__card">
                <div className="accounts__card_row title">
                    <span className="text__main">Account 1</span>
                    <Pencil />
                </div>
                <div className="accounts__card_row">
                    <span className="capture__main_small">bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</span>
                    <Copy />
                </div>
                <div className="accounts__card_row">
                    <span className="text__main_regular">Total Balance</span>
                    <span className="text__main_medium">4,227.38 USD</span>
                </div>
                <div className="accounts__card_row" onClick={() => navToConnect()}>
                    <span className="text__main_regular">Connected sites</span>
                    <span className="text__main_medium">See list</span>
                    <ArrowRight />
                </div>
                <div className="accounts__card_row">
                    <span className="text__main_regular">Private key</span>
                    <span className="text__main_medium">Export</span>
                    <ArrowRight />
                </div>
                <div className="accounts__card_row">
                    <span className="text__main_regular">Attached to</span>
                    <span className="text__main_medium">Identity 1</span>
                    <ArrowRight />
                </div>
            </div>
            <div className="accounts__card">
                <div className="accounts__card_row title">
                    <span className="text__main">Account 2</span>
                    <Pencil />
                </div>
                <div className="accounts__card_row">
                    <span className="capture__main_small">bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh</span>
                    <Copy />
                </div>
                <div className="accounts__card_row">
                    <span className="text__main_regular">Total Balance</span>
                    <span className="text__main_medium">4,227.38 USD</span>
                </div>
                <div className="accounts__card_row" onClick={() => navToConnect()}>
                    <span className="text__main_regular">Connected sites</span>
                    <span className="text__main_medium">See list</span>
                    <ArrowRight />
                </div>
                <div className="accounts__card_row">
                    <span className="text__main_regular">Private key</span>
                    <span className="text__main_medium">Export</span>
                    <ArrowRight />
                </div>
                <div className="accounts__card_row">
                    <span className="text__main_regular">Attached to</span>
                    <span className="text__main_medium">Identity 1</span>
                    <ArrowRight />
                </div>
            </div>
            <div className="accounts__card">
                <div className="accounts__card_row title">
                    <span className="text__main">Account 3</span>
                    <Pencil />
                </div>
                <div className="accounts__card_row">
                    <span className="capture__main_small">tt2kgdygjrsqtzq2n0yrf2493p83kkfjh50eo</span>
                    <Copy />
                </div>
                <div className="accounts__card_row">
                    <span className="text__main_regular">Total Balance</span>
                    <span className="text__main_medium">1,195.41 USD</span>
                </div>
                <div className="accounts__card_row" onClick={() => navToConnect()}>
                    <span className="text__main_regular">Connected sites</span>
                    <span className="text__main_medium">See list</span>
                    <ArrowRight />
                </div>
                <div className="accounts__card_row">
                    <span className="text__main_regular">Private key</span>
                    <span className="text__main_medium">Export</span>
                    <ArrowRight />
                </div>
                <div className="accounts__card_row">
                    <span className="text__main_regular">Attached to</span>
                    <span className="text__main_medium">Identity 2</span>
                    <ArrowRight />
                </div>
            </div>
        </div>
    );
}
