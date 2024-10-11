import React from 'react';

import { Connection, Fullscreen, MenuButton, MenuTiles } from '@popup/popupX/page-layouts/MainLayout/Header/components';
import clsx from 'clsx';
import AccountSelector from './components/AccountSelector';

type HeaderProps = {
    isScrolling: boolean;
    hideMenu: boolean;
    menuOpen: boolean;
    hideConnection: boolean;
    setMenuOpen: (open: boolean) => void;
};

export default function Header({ isScrolling, hideMenu, hideConnection, menuOpen, setMenuOpen }: HeaderProps) {
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
