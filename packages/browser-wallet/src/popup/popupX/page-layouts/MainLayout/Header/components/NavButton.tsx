import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import ArrowsLeft from '@assets/svgX/arrow-left.svg';
import Button from '@popup/popupX/shared/Button';
import { useTranslation } from 'react-i18next';
import { absoluteRoutes } from '@popup/popupX/constants/routes';

type NavButtonProps = {
    hideBackArrow: boolean;
    backTitle?: string;
    navBackSteps: number;
};

export default function NavButton({ hideBackArrow, backTitle, navBackSteps }: NavButtonProps) {
    const nav = useNavigate();
    const { pathname } = useLocation();
    const { t } = useTranslation('x', { keyPrefix: 'header.navButton' });

    if (hideBackArrow) return null;

    const splitPath = pathname.split('/');
    const topLocation = splitPath.slice(0, splitPath.length - navBackSteps).join('/');
    const navRoute = (topLocation === absoluteRoutes.settings.path && absoluteRoutes.home.path) || topLocation;

    const title = backTitle || (navRoute === absoluteRoutes.home.path && t('toMain')) || '';

    return (
        <div className={clsx('header__nav', hideBackArrow && 'hidden')}>
            <Button.Base
                type="button"
                className="header__nav_button"
                onClick={() => {
                    if (topLocation === pathname) {
                        // Fallback nav
                        nav(-1);
                    } else {
                        nav(navRoute);
                    }
                }}
            >
                <ArrowsLeft />
                <span className="text__main_medium">{title}</span>
            </Button.Base>
        </div>
    );
}
