import React from 'react';
import Identification from '@assets/svgX/identification-badge.svg';
import Browsers from '@assets/svgX/browsers.svg';
import TextColumns from '@assets/svgX/text-columns.svg';
import Password from '@assets/svgX/password.svg';
import WebId from '@assets/svgX/web-id.svg';
import Plant from '@assets/svgX/plant.svg';
import LinkSimple from '@assets/svgX/link-simple-horizontal.svg';
import Info from '@assets/svgX/info2.svg';
import Restore from '@assets/svgX/arrow-counter-clock.svg';
import IconButton from '@popup/shared/IconButton';
import Text from '@popup/popupX/shared/Text';
import { Link } from 'react-router-dom';
import { relativeRoutes } from '@popup/popupX/constants/routes';

export default function MenuTiles({ menuOpen, setMenuOpen }) {
    if (!menuOpen) return null;
    return (
        <div className="main-header__menu-tiles fade-menu-bg">
            <div className="main-header__menu-tiles_container" onClick={() => setMenuOpen(false)}>
                <Link to={relativeRoutes.settings.idCards.path}>
                    <IconButton className="main-header__menu-tiles_tile wide">
                        <Identification />
                        <Text.Capture>Identities</Text.Capture>
                    </IconButton>
                </Link>
                <Link to={relativeRoutes.settings.accounts.path}>
                    <IconButton className="main-header__menu-tiles_tile wide">
                        <Browsers />
                        <Text.Capture>Accounts</Text.Capture>
                    </IconButton>
                </Link>
                <Link to={relativeRoutes.settings.seedPhrase.path}>
                    <IconButton className="main-header__menu-tiles_tile">
                        <TextColumns />
                        <Text.Capture>Seed phrase</Text.Capture>
                    </IconButton>
                </Link>
                <Link to="/">
                    <IconButton className="main-header__menu-tiles_tile">
                        <Password />
                        <Text.Capture>Passcode</Text.Capture>
                    </IconButton>
                </Link>
                <Link to={relativeRoutes.settings.web3Id.path}>
                    <IconButton className="main-header__menu-tiles_tile">
                        <WebId />
                        <Text.Capture>Web3 ID</Text.Capture>
                    </IconButton>
                </Link>
                <Link to="/">
                    <IconButton className="main-header__menu-tiles_tile">
                        <Plant />
                        <Text.Capture>Earn</Text.Capture>
                    </IconButton>
                </Link>
                <Link to={relativeRoutes.settings.network.path}>
                    <IconButton className="main-header__menu-tiles_tile">
                        <LinkSimple />
                        <Text.Capture>Network</Text.Capture>
                    </IconButton>
                </Link>
                <Link to="/">
                    <IconButton className="main-header__menu-tiles_tile">
                        <Info />
                        <Text.Capture>About</Text.Capture>
                    </IconButton>
                </Link>
                <Link to="/">
                    <IconButton className="main-header__menu-tiles_tile">
                        <Restore />
                        <Text.Capture>Restore</Text.Capture>
                    </IconButton>
                </Link>
            </div>
        </div>
    );
}
