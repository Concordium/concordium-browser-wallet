import Button from '@popup/shared/Button';
import React, { Children, ReactNode, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

import BackIcon from '@assets/svg/back-arrow.svg';
import ListIcon from '@assets/svg/list.svg';
import SendIcon from '@assets/svg/paperplane.svg';
import ReceiveIcon from '@assets/svg/qr.svg';
import SettingsIcon from '@assets/svg/cog.svg';

import clsx from 'clsx';
import { accountRoutes } from '../routes';

const SCROLL_LIMIT = 5;

type ActionLinksProps = {
    children: ReactNode[];
};

function ActionLinks({ children }: ActionLinksProps) {
    const linksRef = useRef<HTMLDivElement>(null);
    const links = Children.count(children);
    const canScroll = links > SCROLL_LIMIT;

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

interface Props {
    className: string;
    setDetailsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
}

export default function AccountActions({ className, setDetailsExpanded }: Props) {
    const { t } = useTranslation('account', { keyPrefix: 'actions' });

    return (
        <nav className={clsx('account-page-actions', className)}>
            <ActionLinks>
                <NavLink className="account-page-actions__link" to="" end title={t('log')}>
                    <ListIcon className="account-page-actions__list-icon" />
                </NavLink>
                <NavLink className="account-page-actions__link" to={accountRoutes.send} title={t('send')}>
                    <SendIcon className="account-page-actions__send-icon" />
                </NavLink>
                <NavLink className="account-page-actions__link" to={accountRoutes.receive} title={t('receive')}>
                    <ReceiveIcon className="account-page-actions__receive-icon" />
                </NavLink>
                <NavLink
                    className="account-page-actions__link"
                    to={accountRoutes.settings}
                    title={t('settings')}
                    onClick={() => setDetailsExpanded(false)}
                >
                    <SettingsIcon className="account-page-actions__settings-icon" />
                </NavLink>
            </ActionLinks>
        </nav>
    );
}
