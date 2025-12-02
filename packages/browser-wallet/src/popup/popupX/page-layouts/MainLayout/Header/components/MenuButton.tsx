import React from 'react';
import DotsNine from '@assets/svgX/UiKit/MenuNavigation/navigation-dots-menu-button.svg';
import Close from '@assets/svgX/UiKit/Interface/x-cross-close.svg';
import clsx from 'clsx';
import Button from '@popup/popupX/shared/Button';

type Props = {
    setMenuOpen: (open: boolean) => void;
    menuOpen: boolean;
    hideMenu: boolean;
};

export default function MenuButton({ setMenuOpen, menuOpen, hideMenu }: Props) {
    return (
        <div className={clsx('main-header__menu', hideMenu && 'hidden')}>
            <Button.Icon
                icon={menuOpen ? <Close /> : <DotsNine />}
                onClick={() => {
                    setMenuOpen(!menuOpen);
                }}
            />
        </div>
    );
}
