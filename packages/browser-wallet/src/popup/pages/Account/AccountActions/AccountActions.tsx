import Button from '@popup/shared/Button';
import React, { Children, ReactNode } from 'react';
import { NavLink } from 'react-router-dom';
import { accountRoutes } from '../routes';

type ActionLinksProps = {
    children: ReactNode[];
};

function ActionLinks({ children }: ActionLinksProps) {
    const links = Children.count(children);
    const canScroll = links > 5;

    return (
        <>
            {canScroll && (
                <Button className="account-page-actions__left" clear>
                    &lt;
                </Button>
            )}
            <div className="account-page-actions__links">{children}</div>
            {canScroll && (
                <Button className="account-page-actions__right" clear>
                    &gt;
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
            </ActionLinks>
        </nav>
    );
}
