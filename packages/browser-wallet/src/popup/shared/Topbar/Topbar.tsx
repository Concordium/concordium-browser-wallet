import React, { useState } from 'react';
import BackIcon from '@assets/svg/back-icon.svg';
import MoreIcon from '@assets/svg/more.svg';
import clsx from 'clsx';
import Button from '../Button';
import PopupMenu, { PopupMenuItem } from '../PopupMenu/PopupMenu';

export enum ButtonTypes {
    More,
}

interface MoreMenuButton {
    type: ButtonTypes.More;
    items: PopupMenuItem[];
}

export type MenuButton = MoreMenuButton;

interface TopbarProps {
    title: string;
    onBackButtonClick?: () => void;
    menuButton?: MenuButton;
}

export default function Topbar({ title, onBackButtonClick, menuButton }: TopbarProps) {
    const [showPopupMenu, setShowPopupMenu] = useState<boolean>(false);

    return (
        <div className="topbar">
            <div className="topbar__icon-container">
                {onBackButtonClick && (
                    <Button clear onClick={onBackButtonClick}>
                        <BackIcon className="topbar__icon-container__icon" />
                    </Button>
                )}
            </div>
            <div className="topbar__title display6">{title}</div>
            <div className="topbar__icon-container">
                {menuButton && (
                    <>
                        <Button clear onClick={() => setShowPopupMenu(true)}>
                            <MoreIcon className="topbar__icon-container__icon" />
                        </Button>
                        <div className={clsx('topbar__popup-menu', showPopupMenu && 'topbar__popup-menu__show')}>
                            <PopupMenu
                                items={menuButton.items}
                                onClickOutside={() => setShowPopupMenu(false)}
                                afterButtonClick={() => setShowPopupMenu(false)}
                            />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
