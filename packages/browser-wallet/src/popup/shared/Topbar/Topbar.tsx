import React from 'react';
import BackIcon from '@assets/svg/back-icon.svg';
import MoreIcon from '@assets/svg/more.svg';
import { useNavigate } from 'react-router-dom';
import Button from '../Button';

export enum ButtonTypes {
    More,
}

interface NoBackButton {
    show: false;
}

interface ShowBackButton {
    show: true;
    onClick: () => void;
}

type BackButton = ShowBackButton | NoBackButton;

interface MenuButton {
    type: ButtonTypes;
    onClick: () => void;
}

interface TopbarProps {
    title: string;
    backButton?: BackButton;
    menuButton?: MenuButton;
}

export default function Topbar({
    title,
    backButton = {
        show: true,
        onClick: () => {
            const nav = useNavigate();
            return nav(-1);
        },
    },
    menuButton,
}: TopbarProps) {
    return (
        <div className="topbar">
            <div className="topbar__icon-container">
                {backButton.show && (
                    <Button clear onClick={backButton.onClick}>
                        <BackIcon className="topbar__icon-container__icon" />
                    </Button>
                )}
            </div>
            <div className="topbar__title display6">{title}</div>
            <div className="topbar__icon-container">
                {menuButton && (
                    <Button clear onClick={menuButton.onClick}>
                        <MoreIcon className="topbar__icon-container__icon" />
                    </Button>
                )}
            </div>
        </div>
    );
}
