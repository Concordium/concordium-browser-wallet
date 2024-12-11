import React, { useMemo } from 'react';
import { Outlet } from 'react-router-dom';
import Toast from '@popup/popupX/shared/Toast';
import clsx from 'clsx';
import { Connection } from '@popup/popupX/page-layouts/MainLayout/Header/components';
import FullscreenPromptLayout from '@popup/popupX/page-layouts/FullscreenPromptLayout';

function Header({ isScrolling }: { isScrolling: boolean }) {
    return (
        <div className={clsx('main-header', isScrolling && 'scroll-border')}>
            <div className="main-header__top">
                <Connection />
            </div>
        </div>
    );
}

export default function ExternalRequestLayout() {
    const [scroll, setScroll] = React.useState(0);
    const isScrolling = useMemo(() => scroll > 0, [!!scroll]);
    return (
        <FullscreenPromptLayout>
            <Header isScrolling={isScrolling} />
            <div className="external-request-layout-x">
                <main
                    className={clsx('external-request-layout-x__main')}
                    onScroll={(e) => {
                        setScroll(e.currentTarget.scrollTop);
                    }}
                >
                    <Outlet />
                </main>
                <Toast />
            </div>
        </FullscreenPromptLayout>
    );
}
