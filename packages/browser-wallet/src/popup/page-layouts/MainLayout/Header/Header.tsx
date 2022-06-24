import React, { PropsWithChildren, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion, Variants } from 'framer-motion';

import Logo from '@assets/svg/concordium.svg';
import CheckmarkIcon from '@assets/svg/checkmark-blue.svg';
import NavList from '@popup/shared/NavList';
import Button from '@popup/shared/Button';
import { absoluteRoutes } from '@popup/constants/routes';
import CloseIcon from '@assets/svg/cross.svg';
import BackIcon from '@assets/svg/back-arrow.svg';
import { defaultTransition } from '@shared/constants/transition';
import AccountList from '../AccountList';

const MotionNavList = motion(NavList);
const MotionAccountList = motion(AccountList);

type HeaderLinkProps = PropsWithChildren<{
    onClick(): void;
    to: string;
}>;

function HeaderLink({ to, children, onClick }: HeaderLinkProps) {
    return (
        <NavLink
            onClick={onClick}
            className={({ isActive }) =>
                clsx('main-layout-header__nav-item', isActive && 'main-layout-header__nav-item--active')
            }
            to={to}
        >
            {({ isActive }) => (
                <div className="inline-flex align-center relative">
                    {children}
                    {isActive && <CheckmarkIcon />}
                </div>
            )}
        </NavLink>
    );
}

const transitionVariants: Variants = {
    open: { y: 0 },
    closed: { y: '-100%' },
};

enum Section {
    Account,
    Id,
    Settings,
}

type Props = {
    onToggle(open: boolean): void;
};

export default function Header({ onToggle }: Props) {
    const { t } = useTranslation('mainLayout');
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const { pathname } = useLocation();
    const [navOpen, setNavOpen] = useState(false);
    const nav = useNavigate();

    useEffect(() => {
        onToggle(navOpen || dropdownOpen);
    }, [navOpen, dropdownOpen, onToggle]);

    useEffect(() => {
        setDropdownOpen(false);
        setNavOpen(false);
    }, [pathname]);

    useEffect(() => {
        if (navOpen) {
            setDropdownOpen(false);
        }
    }, [navOpen]);

    useEffect(() => {
        if (dropdownOpen) {
            setNavOpen(false);
        }
    }, [dropdownOpen]);

    // eslint-disable-next-line no-nested-ternary
    const section = pathname.includes(absoluteRoutes.home.identities.path)
        ? Section.Id
        : pathname.includes(absoluteRoutes.home.settings.path)
        ? Section.Settings
        : Section.Account;

    const isHomePage = pathname === absoluteRoutes.home.path;

    return (
        <>
            <header className={clsx('main-layout-header', navOpen && 'main-layout-header--nav-open')}>
                <div className="main-layout-header__bar">
                    <Button className="main-layout-header__logo" clear onClick={() => setNavOpen((o) => !o)}>
                        <Logo />
                    </Button>
                    <h1 className="relative flex align-center">
                        {section === Section.Id && t('header.ids')}
                        {section === Section.Settings && t('header.settings')}
                        {section === Section.Account && t('header.accounts')}
                        {[Section.Account, Section.Id].includes(section) && (
                            <Button
                                clear
                                className={clsx(
                                    'main-layout-header__page-dropdown-button',
                                    dropdownOpen && 'main-layout-header__page-dropdown-button--open'
                                )}
                                onClick={() => setDropdownOpen((o) => !o)}
                            >
                                <BackIcon />
                            </Button>
                        )}
                    </h1>
                    {isHomePage || (
                        <Button
                            className="main-layout-header__close"
                            onClick={() => nav(absoluteRoutes.home.path)}
                            clear
                        >
                            <CloseIcon />
                        </Button>
                    )}
                </div>
                <AnimatePresence>
                    {navOpen && (
                        <MotionNavList
                            className="main-layout-header__nav"
                            variants={transitionVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            transition={defaultTransition}
                        >
                            <HeaderLink onClick={() => setNavOpen(false)} to={absoluteRoutes.home.path}>
                                {t('header.accounts')}
                            </HeaderLink>
                            <HeaderLink onClick={() => setNavOpen(false)} to={absoluteRoutes.home.identities.path}>
                                {t('header.ids')}
                            </HeaderLink>
                            <HeaderLink onClick={() => setNavOpen(false)} to={absoluteRoutes.home.settings.path}>
                                {t('header.settings')}
                            </HeaderLink>
                        </MotionNavList>
                    )}
                </AnimatePresence>
                <AnimatePresence>
                    {dropdownOpen && section === Section.Account && (
                        <MotionAccountList
                            onSelect={() => setDropdownOpen(false)}
                            className="main-layout-header__page-dropdown"
                            variants={transitionVariants}
                            initial="closed"
                            animate="open"
                            exit="closed"
                            transition={defaultTransition}
                        />
                    )}
                </AnimatePresence>
            </header>
            {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events */}
            {navOpen && <div className="absolute t-0 w-full h-full" onClick={() => setNavOpen(false)} />}
        </>
    );
}
