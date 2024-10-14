import React, { useEffect } from 'react';
import DotsNine from '@assets/svgX/dots-nine.svg';
import Close from '@assets/svgX/close.svg';
import clsx from 'clsx';

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
            <button
                type="button"
                className="main-header__menu_button"
                onClick={() => {
                    setMenuOpen(!menuOpen);
                }}
            >
                {menuOpen ? <Close /> : <DotsNine />}
            </button>
        </div>
    );
}
