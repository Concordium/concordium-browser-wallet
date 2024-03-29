import React from 'react';
import { DetectClickOutside } from 'wallet-common-helpers';
import clsx from 'clsx';
import Button from '../Button/Button';

export interface PopupMenuItem {
    title: string;
    icon?: JSX.Element;
    onClick?: () => void;
}

interface PopupMenuProps {
    items: PopupMenuItem[];
    onClickOutside: () => void;
    afterButtonClick: () => void;
}

export default function PopupMenu({ items, afterButtonClick, onClickOutside }: PopupMenuProps) {
    return (
        <DetectClickOutside onClickOutside={onClickOutside}>
            <div className="popup-menu">
                {items.map((item) => {
                    return (
                        <Button
                            key={item.title}
                            clear
                            className={clsx('popup-menu__item', item.onClick ? null : 'popup-menu__item--disabled')}
                            onClick={() => {
                                if (item.onClick) {
                                    item.onClick();
                                }
                                afterButtonClick();
                            }}
                        >
                            <div className="popup-menu__item__title heading6">{item.title}</div>
                            <div className="popup-menu__item__icon">{item.icon}</div>
                        </Button>
                    );
                })}
            </div>
        </DetectClickOutside>
    );
}
