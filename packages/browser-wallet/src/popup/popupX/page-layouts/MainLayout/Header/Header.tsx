import React, { useMemo } from 'react';
import { useLocation } from 'react-router-dom';

import { Connection, Fullscreen, MenuButton, MenuTiles } from '@popup/popupX/page-layouts/MainLayout/Header/components';
import clsx from 'clsx';
import AccountSelector from './components/AccountSelector';

export default function Header({
    isScrolling,
    hideMenu,
    hideConnection,
    menuOpen,
    setMenuOpen,
}: {
    isScrolling: boolean;
    hideMenu: boolean;
    menuOpen: boolean;
    hideConnection: boolean;
    setMenuOpen: (open: boolean) => void;
}) {
    return (
        <div className={clsx('main-header', isScrolling && 'scroll-border')}>
            <div className="main-header__top">
                <Fullscreen />
                <Connection hideConnection={hideConnection} />
            </div>
            <div className="main-header__bottom">
                <MenuButton setMenuOpen={setMenuOpen} menuOpen={menuOpen} hideMenu={hideMenu} />
            </div>
            <MenuTiles menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
            <AccountSelector showAccountSelector={false} />
        </div>
    );
}
