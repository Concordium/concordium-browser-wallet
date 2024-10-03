import React, { useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import Header from '@popup/popupX/page-layouts/MainLayout/Header';
import { AccountButton, NavButton } from '@popup/popupX/page-layouts/MainLayout/Header/components';
import { relativeRoutes } from '@popup/popupX/constants/routes';

function exctractByProps(obj, props) {
    return props.reduce((acc, prop) => (typeof acc === 'object' && prop in acc ? acc[prop] : undefined), obj);
}

const getPageConfig = () => {
    const location = useLocation();
    const keyArray = useMemo(() => location.pathname.split('/').slice(1), [location.pathname]);
    const config = exctractByProps(relativeRoutes, keyArray)?.config;
    return config || {};
};

export default function MainLayout() {
    const [scroll, setScroll] = React.useState(0);
    const isScrolling = useMemo(() => scroll > 0, [!!scroll]);
    const [menuOpen, setMenuOpen] = React.useState(false);
    const { hideBackArrow, backTitle, hideMenu, hideConnection, showAccountSelector } = getPageConfig();
    return (
        <div className="main-layout-x">
            <Header {...{ isScrolling, hideMenu, hideConnection, menuOpen, setMenuOpen }} />
            <main
                className={clsx('main-layout-x__main')}
                onScroll={(e) => {
                    setScroll(e.target.scrollTop);
                }}
            >
                <div className="float-section">
                    <NavButton hideBackArrow={hideBackArrow || menuOpen} backTitle={backTitle} />
                    {showAccountSelector && <AccountButton />}
                </div>
                <Outlet />
            </main>
        </div>
    );
}
