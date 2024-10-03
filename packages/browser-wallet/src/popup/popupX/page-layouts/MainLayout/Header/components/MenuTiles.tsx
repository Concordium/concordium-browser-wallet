import React from 'react';
import Identification from '@assets/svgX/identification-badge.svg';
import Browsers from '@assets/svgX/browsers.svg';
import TextColumns from '@assets/svgX/text-columns.svg';
import Password from '@assets/svgX/password.svg';
import WebId from '@assets/svgX/web-id.svg';
import Plant from '@assets/svgX/plant.svg';
import LinkSimple from '@assets/svgX/link-simple-horizontal.svg';
import Info from '@assets/svgX/info2.svg';
import Nft from '@assets/svgX/cube-focus.svg';
import IconButton from '@popup/shared/IconButton';
import { Link } from 'react-router-dom';
import { absoluteRoutes } from '@popup/popupX/constants/routes';

export default function MenuTiles({ menuOpen, setMenuOpen }) {
    if (!menuOpen) return null;
    return (
        <div className="main-header__menu-tiles fade-menu-bg">
            <div className="main-header__menu-tiles_container" onClick={() => setMenuOpen(false)}>
                <Link to={absoluteRoutes.settings.idCards.path}>
                    <IconButton className="main-header__menu-tiles_tile wide">
                        <Identification />
                        <span className="capture__main_small">Identities</span>
                    </IconButton>
                </Link>
                <Link to={absoluteRoutes.settings.accounts.path}>
                    <IconButton className="main-header__menu-tiles_tile wide">
                        <Browsers />
                        <span className="capture__main_small">Accounts</span>
                    </IconButton>
                </Link>
                <Link to={absoluteRoutes.settings.seedPhrase.path}>
                    <IconButton className="main-header__menu-tiles_tile">
                        <TextColumns />
                        <span className="capture__main_small">Seed phrase</span>
                    </IconButton>
                </Link>
                <Link to="/">
                    <IconButton className="main-header__menu-tiles_tile">
                        <Password />
                        <span className="capture__main_small">Passcode</span>
                    </IconButton>
                </Link>
                <Link to={absoluteRoutes.settings.web3Id.path}>
                    <IconButton className="main-header__menu-tiles_tile">
                        <WebId />
                        <span className="capture__main_small">Web3 ID</span>
                    </IconButton>
                </Link>
                <Link to="/">
                    <IconButton className="main-header__menu-tiles_tile">
                        <Plant />
                        <span className="capture__main_small">Earn</span>
                    </IconButton>
                </Link>
                <Link to={absoluteRoutes.settings.network.path}>
                    <IconButton className="main-header__menu-tiles_tile">
                        <LinkSimple />
                        <span className="capture__main_small">Network</span>
                    </IconButton>
                </Link>
                <Link to="/">
                    <IconButton className="main-header__menu-tiles_tile">
                        <Info />
                        <span className="capture__main_small">About</span>
                    </IconButton>
                </Link>
                <Link to="/">
                    <IconButton className="main-header__menu-tiles_tile">
                        <Nft />
                        <span className="capture__main_small">NFT</span>
                    </IconButton>
                </Link>
            </div>
        </div>
    );
}
