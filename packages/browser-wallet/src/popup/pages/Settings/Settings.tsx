import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { absoluteRoutes } from '@popup/constants/routes';
import NavList from '@popup/shared/NavList';
import { useAtom } from 'jotai';
import { themeAtom, uiStyleAtom } from '@popup/store/settings';
import { Theme, UiStyle } from '@shared/storage/types';
import SunIcon from '@assets/svg/sun.svg';
import MoonIcon from '@assets/svg/moon.svg';
import { ToggleCheckbox } from '@popup/shared/Form/ToggleCheckbox';
import { popupMessageHandler } from '@popup/shared/message-handler';
import { InternalMessageType } from '@messaging';
import Button from '@popup/shared/Button';
import { isFullscreenWindow } from '@popup/shared/window-helpers';
import { routePrefix } from '@popup/popupX/constants/routes';

function LightDarkModeToggle() {
    const { t } = useTranslation('settings');
    const [theme, setTheme] = useAtom(themeAtom);

    return (
        <div className="settings-page__toggle">
            <div>{theme === Theme.Light ? t('toggle.dark') : t('toggle.light')}</div>
            <ToggleCheckbox
                checked={theme === Theme.Dark}
                onChange={() => (theme === Theme.Light ? setTheme(Theme.Dark) : setTheme(Theme.Light))}
                icon={theme === Theme.Light ? <MoonIcon /> : <SunIcon className="settings-page__sun-icon" />}
            />
        </div>
    );
}

export default function Settings() {
    const { t } = useTranslation('settings');

    const [, setUiStyle] = useAtom(uiStyleAtom);

    return (
        <div className="settings-page">
            <NavList>
                <Link className="settings-page__link" to={absoluteRoutes.home.settings.allowlist.path}>
                    {t('allowlist')}
                </Link>
                <Link className="settings-page__link" to={absoluteRoutes.home.settings.passcode.path}>
                    {t('passcode')}
                </Link>
                <Link className="settings-page__link" to={absoluteRoutes.home.settings.network.path}>
                    {t('network')}
                </Link>
                <Link className="settings-page__link" to={absoluteRoutes.home.settings.recovery.path}>
                    {t('recover')}
                </Link>
                <Link className="settings-page__link" to={absoluteRoutes.home.settings.seedPhrase.path}>
                    {t('seedPhrase')}
                </Link>
                {!isFullscreenWindow && (
                    <Button
                        clear
                        className="settings-page__link settings-page__link--button"
                        onClick={() => {
                            popupMessageHandler.sendInternalMessage(InternalMessageType.OpenFullscreen);
                        }}
                    >
                        {t('fullscreenWallet')}
                    </Button>
                )}
                <Link
                    className="settings-page__link"
                    to={`${routePrefix}/home`}
                    onClick={() => {
                        setUiStyle(UiStyle.WalletX);
                    }}
                >
                    Wallet X
                </Link>
                <Link className="settings-page__link" to={absoluteRoutes.home.settings.about.path}>
                    {t('about')}
                </Link>
            </NavList>
            <LightDarkModeToggle />
        </div>
    );
}
