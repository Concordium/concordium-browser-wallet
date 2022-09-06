import { absoluteRoutes } from '@popup/constants/routes';
import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import { selectedAccountAtom, storedConnectedSitesAtom } from '@popup/store/account';
import { sessionPasscodeAtom } from '@popup/store/settings';
import { useAtom, useAtomValue } from 'jotai';
import React, { useContext, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, Navigate } from 'react-router-dom';
import Button from '@popup/shared/Button';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import { displaySplitAddress } from '@popup/shared/utils/account-helpers';

type Props = {
    onAllow(): void;
    onReject(): void;
};

export default function ConnectionRequest({ onAllow, onReject }: Props) {
    const { state } = useLocation();
    const { t } = useTranslation('connectionRequest');
    const { onClose, withClose } = useContext(fullscreenPromptContext);
    const selectedAccount = useAtomValue(selectedAccountAtom);
    const [connectedSitesLoading, setConnectedSites] = useAtom(storedConnectedSitesAtom);
    const connectedSites = connectedSitesLoading.value;
    const passcode = useAtomValue(sessionPasscodeAtom);

    useEffect(() => onClose(onReject), [onClose, onReject]);

    if (!selectedAccount || connectedSitesLoading.loading || passcode.loading) {
        return null;
    }

    // The wallet is locked, so prompt the user to unlock the wallet before connecting.
    if (!passcode.value) {
        return (
            <Navigate
                to={absoluteRoutes.login.path}
                state={{ to: absoluteRoutes.prompt.connectionRequest.path, toState: state }}
            />
        );
    }

    function connectAccount(account: string, url: string) {
        const updatedConnectedSites = {
            ...connectedSites,
        };

        const connectedSitesForAccount = connectedSites[account] ?? [];
        connectedSitesForAccount.push(url);
        updatedConnectedSites[account] = connectedSitesForAccount;

        setConnectedSites(updatedConnectedSites);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { title, url } = (state as any).payload;
    const urlOrigin = new URL(url).origin;
    const urlDisplay = displayUrl(url);

    return (
        <div className="h-full flex-column align-center">
            <div className="account-page__connection-box connection-request__connection-box">{t('waiting')}</div>
            <header className="m-t-20 m-b-40">
                <h1>{t('title', { dApp: urlDisplay, account: displaySplitAddress(selectedAccount) })}</h1>
            </header>
            <p className="connection-request__description">{t('descriptionP1', { dApp: urlDisplay })}</p>
            <p className="connection-request__description">{t('descriptionP2')}</p>
            <pre className="connection-request__url">{title}</pre>
            <pre className="connection-request__url">{urlOrigin}</pre>
            <div className="flex p-b-10  m-t-auto">
                <Button width="narrow" className="m-r-10" onClick={withClose(onReject)}>
                    {t('actions.cancel')}
                </Button>
                <Button
                    width="narrow"
                    onClick={withClose(() => {
                        connectAccount(selectedAccount, urlOrigin);
                        onAllow();
                    })}
                >
                    {t('actions.connect')}
                </Button>
            </div>
        </div>
    );
}
