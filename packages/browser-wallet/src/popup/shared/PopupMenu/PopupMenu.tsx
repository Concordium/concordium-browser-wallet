import React from 'react';
import { DetectClickOutside } from 'wallet-common-helpers';
import Button from '../Button/Button';

export interface PopupMenuItem {
    title: string;
    icon: JSX.Element;
    onClick?: () => void;
}

interface PopupMenuProps {
    items: PopupMenuItem[];
    onClickOutside: () => void;
}

export default function PopupMenu({ items, onClickOutside }: PopupMenuProps) {
    return (
        <DetectClickOutside onClickOutside={onClickOutside}>
            <div className="popup-menu">
                {items.map((item) => {
                    return (
                        <Button clear className="popup-menu__item" onClick={item.onClick}>
                            <div className="popup-menu__item__title heading6">{item.title}</div>
                            <div className="popup-menu__item__icon">{item.icon}</div>
                        </Button>
                    );
                })}
            </div>
        </DetectClickOutside>
    );
}
