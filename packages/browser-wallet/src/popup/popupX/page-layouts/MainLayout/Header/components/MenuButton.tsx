import React, { useEffect } from 'react';
import DotsNine from '@assets/svgX/dots-nine.svg';
import Close from '@assets/svgX/close.svg';
import clsx from 'clsx';
import Button from '@popup/popupX/shared/Button';

type Props = {
    setMenuOpen: (open: boolean) => void;
    menuOpen: boolean;
    hideMenu: boolean;
};

const background = document.getElementsByClassName('bg').item(0);

export default function MenuButton({ setMenuOpen, menuOpen, hideMenu }: Props) {
    useEffect(() => {
        if (menuOpen) {
            background?.classList.add('fade-bg');
        } else {
            background?.classList.remove('fade-bg');
        }
    }, [menuOpen]);
    return (
        <div className={clsx('main-header__menu', hideMenu && 'hidden')}>
            <Button.Icon
                className="transparent"
                icon={menuOpen ? <Close /> : <DotsNine />}
                onClick={() => {
                    setMenuOpen(!menuOpen);
                }}
            />
        </div>
    );
}
