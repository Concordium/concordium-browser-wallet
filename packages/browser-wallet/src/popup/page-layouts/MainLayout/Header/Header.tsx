import React, { ComponentType, PropsWithChildren, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { AnimatePresence, AnimationProps, motion, Variants } from 'framer-motion';
import { ClassName, PropsOf } from 'wallet-common-helpers';

import Logo from '@assets/svg/concordium.svg';
import CheckmarkIcon from '@assets/svg/checkmark-blue.svg';
import NavList from '@popup/shared/NavList';
import Button from '@popup/shared/Button';
import { absoluteRoutes } from '@popup/constants/routes';
import { defaultTransition } from '@shared/constants/transition';
import MenuButton from '@popup/shared/MenuButton';
import CloseButton from '@popup/shared/CloseButton';
import AccountList from '../AccountList';
import IdentityList from '../IdentityList';

const MotionNavList = motion(NavList) as ComponentType<PropsOf<typeof NavList> & AnimationProps>; // For some reason, the motion HoC removes children from component props
const MotionAccountList = motion(AccountList);
const MotionIdentityList = motion(IdentityList);

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
    Recovery,
}

type Props = ClassName & {
    onToggle(open: boolean): void;
};

export default function Header({ onToggle, className }: Props) {
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

    /* eslint-disable no-nested-ternary */
    const section = pathname.startsWith(absoluteRoutes.home.identities.path)
        ? Section.Id
        : pathname.startsWith(absoluteRoutes.home.settings.path)
        ? pathname.startsWith(absoluteRoutes.home.settings.recovery.path)
            ? Section.Recovery
            : Section.Settings
        : Section.Account;

    const canClose =
        !pathname.startsWith(absoluteRoutes.home.account.path) ||
        pathname.startsWith(absoluteRoutes.home.account.add.path);
    const hasDropdown = [Section.Account, Section.Id].includes(section);

    return (
        <>
            <header className={clsx('main-layout-header', navOpen && 'main-layout-header--nav-open', className)}>
                <div className="main-layout-header__bar">
                    <Button className="main-layout-header__logo" clear onClick={() => setNavOpen((o) => !o)}>
                        <Logo />
                    </Button>
                    <label
                        className={clsx(
                            'main-layout-header__title',
                            hasDropdown && 'main-layout-header__title--has-dropdown'
                        )}
                    >
                        <h1 className="relative flex align-center">
                            {section === Section.Id && t('header.ids')}
                            {section === Section.Recovery && t('header.recovery')}
                            {section === Section.Settings && t('header.settings')}
                            {section === Section.Account && t('header.accounts')}
                            {hasDropdown && (
                                <MenuButton
                                    className="main-layout-header__page-dropdown-button"
                                    open={dropdownOpen}
                                    onClick={() => setDropdownOpen((o) => !o)}
                                />
                            )}
                        </h1>
                    </label>
                    {canClose && (
                        <CloseButton
                            className="main-layout-header__close"
                            onClick={() => nav(absoluteRoutes.home.account.path)}
                        />
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
                            <HeaderLink onClick={() => setNavOpen(false)} to={absoluteRoutes.home.account.path}>
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
                    {dropdownOpen && section === Section.Id && (
                        <MotionIdentityList
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
            {(navOpen || dropdownOpen) && (
                // eslint-disable-next-line jsx-a11y/no-static-element-interactions, jsx-a11y/click-events-have-key-events
                <div
                    className="absolute t-0 w-full h-full"
                    onClick={() => {
                        setNavOpen(false);
                        setDropdownOpen(false);
                    }}
                />
            )}
        </>
    );
}
