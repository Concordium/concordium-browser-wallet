import clsx from 'clsx';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ClassName } from 'wallet-common-helpers';

import React, { Children, ReactNode, useRef } from 'react';
import Button from '@popup/shared/Button';

import BackIcon from '@assets/svg/back-arrow.svg';
import ListIcon from '@assets/svg/list.svg';
import SendIcon from '@assets/svg/paperplane.svg';
import ReceiveIcon from '@assets/svg/qr.svg';
import SettingsIcon from '@assets/svg/cog.svg';
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

type ActionProps = {
    children: ReactNode;
    to: string;
    title: string;
    disabled?: boolean;
    end?: boolean;
    onClick?: () => void;
};

function Action({ children, to, title, disabled = false, end = false, onClick = undefined }: ActionProps) {
    return disabled ? (
        <Button className="account-page-actions__link-disabled" disabled title={title}>
            {children}
        </Button>
    ) : (
        <NavLink className="account-page-actions__link" to={to} end={end} title={title} onClick={onClick}>
            {children}
        </NavLink>
    );
}

type Props = ClassName & {
    disabled: boolean;
    setDetailsExpanded: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function AccountActions({ className, disabled, setDetailsExpanded }: Props) {
    const { t } = useTranslation('account', { keyPrefix: 'actions' });

    return (
        <nav className={clsx('account-page-actions', className, disabled && 'account-page-actions-disabled')}>
            <ActionLinks>
                <Action to="" end title={t('log')} disabled={disabled}>
                    <ListIcon className="account-page-actions__list-icon" />
                </Action>
                <Action to={accountRoutes.send} title={t('send')} disabled={disabled}>
                    <SendIcon className="account-page-actions__send-icon" />
                </Action>
                <Action to={accountRoutes.receive} title={t('receive')} disabled={disabled}>
                    <ReceiveIcon className="account-page-actions__receive-icon" />
                </Action>
                <Action
                    to={accountRoutes.settings}
                    title={t('settings')}
                    disabled={disabled}
                    onClick={() => setDetailsExpanded(false)}
                >
                    <SettingsIcon className="account-page-actions__settings-icon" />
                </Action>
            </ActionLinks>
        </nav>
    );
}
