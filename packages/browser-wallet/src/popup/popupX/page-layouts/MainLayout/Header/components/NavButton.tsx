import React from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowsLeft from '@assets/svgX/arrow-left.svg';
import clsx from 'clsx';
import Button from '@popup/popupX/shared/Button';

type NavButtonProps = {
    hideBackArrow: boolean;
    backTitle?: string;
};

export default function NavButton({ hideBackArrow, backTitle = 'to Main page' }: NavButtonProps) {
    const nav = useNavigate();
    if (hideBackArrow) return null;
    return (
        <div className={clsx('header__nav', hideBackArrow && 'hidden')}>
            <Button.Base
                type="button"
                className="header__nav_button"
                onClick={() => {
                    nav(-1);
                }}
            >
                <ArrowsLeft />
                <span className="text__main_medium">{backTitle}</span>
            </Button.Base>
        </div>
    );
}
