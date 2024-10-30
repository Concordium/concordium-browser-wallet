import React, { useEffect } from 'react';

import { Connection, Fullscreen, MenuButton, MenuTiles } from '@popup/popupX/page-layouts/MainLayout/Header/components';
import clsx from 'clsx';
import AccountSelector from './components/AccountSelector';

const background = document.getElementsByClassName('bg').item(0);

type HeaderProps = {
    isScrolling: boolean;
    hideMenu: boolean;
    menuOpen: boolean;
    hideConnection: boolean;
    setMenuOpen: (open: boolean) => void;
    accountOpen: boolean;
    setAccountOpen: (open: boolean) => void;
};

export default function Header({
    isScrolling,
    hideMenu,
    hideConnection,
    menuOpen,
    setMenuOpen,
    accountOpen,
    setAccountOpen,
}: HeaderProps) {
    useEffect(() => {
        if (menuOpen) {
            setAccountOpen(false);
        }
        if (menuOpen || accountOpen) {
            background?.classList.add('fade-bg');
        } else {
            background?.classList.remove('fade-bg');
        }
    }, [menuOpen, accountOpen]);
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
            <AccountSelector showAccountSelector={accountOpen} />
        </div>
    );
}
