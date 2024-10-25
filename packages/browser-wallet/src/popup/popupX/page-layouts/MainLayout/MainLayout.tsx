import React, { useMemo } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import clsx from 'clsx';
import Header from '@popup/popupX/page-layouts/MainLayout/Header';
import { AccountButton, NavButton } from '@popup/popupX/page-layouts/MainLayout/Header/components';
import { relativeRoutes, RoutePath } from '@popup/popupX/constants/routes';

function exctractByProps(obj: typeof relativeRoutes, props: string[]): RoutePath | undefined {
    return props.reduce(
        // FIXME: see if we can get rid of any here...
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (acc: any, prop) => (typeof acc === 'object' && prop in acc ? (acc[prop] as any) : undefined),
        obj
    );
}

const getPageConfig = () => {
    const location = useLocation();
    const keyArray = useMemo(() => location.pathname.split('/').slice(2), [location.pathname]);
    const config = exctractByProps(relativeRoutes, keyArray)?.config;
    return config || {};
};

export default function MainLayout() {
    const [scroll, setScroll] = React.useState(0);
    const isScrolling = useMemo(() => scroll > 0, [!!scroll]);
    const [menuOpen, setMenuOpen] = React.useState(false);
    const [accountOpen, setAccountOpen] = React.useState(false);
    const {
        hideBackArrow = false,
        backTitle = '',
        hideMenu = false,
        hideConnection = false,
        showAccountSelector,
    } = getPageConfig();
    return (
        <div className="main-layout-x">
            <Header
                {...{ isScrolling, hideMenu, hideConnection, menuOpen, setMenuOpen, accountOpen, setAccountOpen }}
            />
            <main
                className={clsx('main-layout-x__main')}
                onScroll={(e) => {
                    setScroll(e.currentTarget.scrollTop);
                }}
            >
                <div className="float-section">
                    <NavButton hideBackArrow={hideBackArrow || menuOpen} backTitle={backTitle} />
                    <AccountButton
                        hideAccountButton={!showAccountSelector || menuOpen}
                        setAccountOpen={setAccountOpen}
                        accountOpen={accountOpen}
                    />
                </div>
                <Outlet />
            </main>
        </div>
    );
}
