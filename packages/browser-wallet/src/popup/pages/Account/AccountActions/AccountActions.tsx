import Button from '@popup/shared/Button';
import React, { Children, ReactNode, useRef } from 'react';
import { NavLink } from 'react-router-dom';

import BackIcon from '@assets/svg/back-arrow.svg';
import { accountRoutes } from '../routes';

type ActionLinksProps = {
    children: ReactNode[];
};

function ActionLinks({ children }: ActionLinksProps) {
    const linksRef = useRef<HTMLDivElement>(null);
    const links = Children.count(children);
    const canScroll = links > 5;

    const scroll = (direction: 'left' | 'right') => () => {
        if (direction === 'left') {
            linksRef.current?.scrollBy({ behavior: 'smooth', left: -linksRef.current.offsetWidth });
        } else {
            linksRef.current?.scrollBy({ behavior: 'smooth', left: linksRef.current.offsetWidth });
        }
    };

    return (
        <>
            {canScroll && (
                <Button className="account-page-actions__left" clear onClick={scroll('left')}>
                    <BackIcon />
                </Button>
            )}
            <div className="account-page-actions__links" ref={linksRef}>
                {children}
            </div>
            {canScroll && (
                <Button className="account-page-actions__right" clear onClick={scroll('right')}>
                    <BackIcon />
                </Button>
            )}
        </>
    );
}

export default function AccountActions() {
    return (
        <nav className="account-page-actions">
            <ActionLinks>
                <NavLink className="account-page-actions__link" to="" end>
                    LI
                </NavLink>
                <NavLink className="account-page-actions__link" to={accountRoutes.send}>
                    SN
                </NavLink>
                <NavLink className="account-page-actions__link" to={accountRoutes.receive}>
                    RE
                </NavLink>
                <NavLink className="account-page-actions__link" to={accountRoutes.settings}>
                    ST
                </NavLink>
                <NavLink className="account-page-actions__link" to="" end>
                    LI
                </NavLink>
                <NavLink className="account-page-actions__link" to={accountRoutes.send}>
                    SN
                </NavLink>
                <NavLink className="account-page-actions__link" to={accountRoutes.receive}>
                    RE
                </NavLink>
            </ActionLinks>
        </nav>
    );
}
