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
import Eye from '@assets/svgX/eye.svg';
import NFT from '@assets/svgX/cube-focus.svg';
import IconButton from '@popup/shared/IconButton';
import Text from '@popup/popupX/shared/Text';
import { Link } from 'react-router-dom';
import { absoluteRoutes } from '@popup/popupX/constants/routes';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { uiStyleAtom } from '@popup/store/settings';
import { UiStyle } from '@shared/storage/types';

type MenuTilesProps = {
    menuOpen: boolean;
    setMenuOpen: (open: boolean) => void;
};

export default function MenuTiles({ menuOpen, setMenuOpen }: MenuTilesProps) {
    const { t } = useTranslation('x', { keyPrefix: 'header.menu' });
    const [, setUiStyle] = useAtom(uiStyleAtom);
    if (!menuOpen) return null;
    return (
        <div className="main-header__menu-tiles fade-menu-bg">
            {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events */}
            <div
                role="button"
                tabIndex={0}
                className="main-header__menu-tiles_container"
                onClick={() => setMenuOpen(false)}
            >
                <Link to={absoluteRoutes.settings.identities.path}>
                    <IconButton className="main-header__menu-tiles_tile wide">
                        <Identification />
                        <Text.Capture>{t('identities')}</Text.Capture>
                    </IconButton>
                </Link>
                <Link to={absoluteRoutes.settings.accounts.path}>
                    <IconButton className="main-header__menu-tiles_tile wide">
                        <Browsers />
                        <Text.Capture>{t('accounts')}</Text.Capture>
                    </IconButton>
                </Link>
                <Link to={absoluteRoutes.settings.seedPhrase.path}>
                    <IconButton className="main-header__menu-tiles_tile">
                        <TextColumns />
                        <Text.Capture>{t('seedPhrase')}</Text.Capture>
                    </IconButton>
                </Link>
                <Link to={absoluteRoutes.settings.passcode.path}>
                    <IconButton className="main-header__menu-tiles_tile">
                        <Password />
                        <Text.Capture>{t('passcode')}</Text.Capture>
                    </IconButton>
                </Link>
                <Link to={absoluteRoutes.settings.web3Id.path}>
                    <IconButton className="main-header__menu-tiles_tile">
                        <WebId />
                        <Text.Capture>{t('web3Id')}</Text.Capture>
                    </IconButton>
                </Link>
                <Link to={absoluteRoutes.settings.earn.path}>
                    <IconButton className="main-header__menu-tiles_tile">
                        <Plant />
                        <Text.Capture>{t('earn')}</Text.Capture>
                    </IconButton>
                </Link>
                <Link to={absoluteRoutes.settings.network.path}>
                    <IconButton className="main-header__menu-tiles_tile">
                        <LinkSimple />
                        <Text.Capture>{t('network')}</Text.Capture>
                    </IconButton>
                </Link>
                <Link to={absoluteRoutes.settings.about.path}>
                    <IconButton className="main-header__menu-tiles_tile">
                        <Info />
                        <Text.Capture>{t('about')}</Text.Capture>
                    </IconButton>
                </Link>
                <Link to={absoluteRoutes.settings.restore.path}>
                    <IconButton className="main-header__menu-tiles_tile">
                        <Restore />
                        <Text.Capture>{t('restore')}</Text.Capture>
                    </IconButton>
                </Link>
                <Link
                    to="/account/tokens"
                    onClick={() => {
                        setUiStyle(UiStyle.Old);
                    }}
                >
                    <IconButton className="main-header__menu-tiles_tile">
                        <Eye />
                        <Text.Capture>{t('oldUI')}</Text.Capture>
                    </IconButton>
                </Link>
                <Link to={absoluteRoutes.settings.nft.path}>
                    <IconButton className="main-header__menu-tiles_tile">
                        <NFT />
                        <Text.Capture>{t('nft')}</Text.Capture>
                    </IconButton>
                </Link>
            </div>
        </div>
    );
}
