import React, { createContext, useMemo } from 'react';
import { Outlet, useLocation, useParams } from 'react-router-dom';
import clsx from 'clsx';
import Header from '@popup/popupX/page-layouts/MainLayout/Header';
import Toast from '@popup/popupX/shared/Toast';
import { AccountButton, NavButton } from '@popup/popupX/page-layouts/MainLayout/Header/components';
import { relativeRoutes, RouteConfig, routePrefix } from '@popup/popupX/constants/routes';
import { withPasswordSession } from '@popup/popupX/shared/utils/hoc';
import { noOp } from 'wallet-common-helpers';

type RouteObj = {
    [index: string]: { [key: string]: object | string | undefined; config?: object; path: string };
};

function getConfig(routes: RouteObj, baseLocation: string) {
    if (!baseLocation) {
        return (routes?.config || {}) as RouteConfig;
    }

    const routeVal = Object.values(routes).find(
        (value) => typeof value === 'object' && value.path && baseLocation.indexOf(value.path) === 1
    );

    if (routeVal) {
        return getConfig(routeVal as RouteObj, baseLocation.replace(`/${routeVal.path}`, ''));
    }

    return {};
}

const getPageConfig = () => {
    const location = useLocation();
    const params = useParams();
    const baseLocation = Object.entries(params).reduce(
        (acc, [key, value = '']) => (key === '*' ? acc.replace(`/${value}`, '') : acc.replace(value, `:${key}`)),
        location.pathname.replace(routePrefix, '')
    );

    return getConfig(relativeRoutes, baseLocation);
};

type ScrollContext = { setScroll: (v: number) => void };

export const mainLayoutScrollContext = createContext<ScrollContext>({ setScroll: noOp });

function MainLayout() {
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
        navBackSteps = 1,
    } = getPageConfig();
    return (
        // eslint-disable-next-line react/jsx-no-constructed-context-values
        <mainLayoutScrollContext.Provider value={{ setScroll }}>
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
                        <NavButton
                            hideBackArrow={hideBackArrow || menuOpen}
                            backTitle={backTitle}
                            navBackSteps={navBackSteps}
                        />
                        <AccountButton
                            hideAccountButton={!showAccountSelector || menuOpen}
                            setAccountOpen={setAccountOpen}
                            accountOpen={accountOpen}
                        />
                    </div>
                    <Outlet />
                </main>
                <Toast />
            </div>
        </mainLayoutScrollContext.Provider>
    );
}

export default withPasswordSession(MainLayout);
