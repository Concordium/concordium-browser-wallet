import React from 'react';
import Button from '../Button/Button';

interface PopupMenuItem {
    title: string;
    icon: JSX.Element;
    onClick?: () => void;
}

interface PopupMenuProps {
    items: PopupMenuItem[];
}

export default function PopupMenu({ items }: PopupMenuProps) {
    return (
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
    );
}
