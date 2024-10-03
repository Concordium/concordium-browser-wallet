import React from 'react';
import { useNavigate } from 'react-router-dom';
import ArrowsLeft from '@assets/svgX/arrow-left.svg';
import clsx from 'clsx';

export default function NavButton({ hideBackArrow, backTitle = 'to Main page' }) {
    const nav = useNavigate();
    if (hideBackArrow) return null;
    return (
        <div className={clsx('header__nav', hideBackArrow && 'hidden')}>
            <button
                type="button"
                className="header__nav_button"
                onClick={() => {
                    nav(-1);
                }}
            >
                <ArrowsLeft />
                <span className="text__main_medium">{backTitle}</span>
            </button>
        </div>
    );
}
