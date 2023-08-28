import React from 'react';
import Logo from '@assets/svg/concordium.svg';

export default function PopupHeader({ headerTitle }: { headerTitle: string }) {
    return (
        <header className="main-layout-header">
            <div className="main-layout-header__bar">
                <div className="main-layout-header__logo">
                    <Logo />
                </div>
                <label className="main-layout-header__title">
                    <h1 className="relative flex align-center">{headerTitle}</h1>
                </label>
            </div>
        </header>
    );
}
