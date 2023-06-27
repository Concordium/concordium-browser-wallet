import { absoluteRoutes } from '@popup/constants/routes';
import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import { selectedAccountAtom, storedAllowlistAtom } from '@popup/store/account';
import { sessionPasscodeAtom } from '@popup/store/settings';
import { useAtom, useAtomValue } from 'jotai';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, Navigate } from 'react-router-dom';
import ExternalRequestLayout from '@popup/page-layouts/ExternalRequestLayout';
import Button from '@popup/shared/Button';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import { displaySplitAddress } from '@popup/shared/utils/account-helpers';
import { handleAllowlistEntryUpdate } from '../Allowlist/util';

type Props = {
    onAllow(): void;
    onReject(): void;
};

export default function ConnectionRequest({ onAllow, onReject }: Props) {
    const { state } = useLocation();
    const { t } = useTranslation('connectionRequest');
    const { onClose, withClose } = useContext(fullscreenPromptContext);
    const selectedAccount = useAtomValue(selectedAccountAtom);
    const [allowlistLoading, setAllowlist] = useAtom(storedAllowlistAtom);
    const allowlist = allowlistLoading.value;
    const passcode = useAtomValue(sessionPasscodeAtom);
    const [connectButtonDisabled, setConnectButtonDisabled] = useState<boolean>(false);

    useEffect(() => onClose(onReject), [onClose, onReject]);

    if (!selectedAccount || allowlistLoading.loading || passcode.loading) {
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

    async function connectAccount(account: string, url: string) {
        await handleAllowlistEntryUpdate(url, allowlist, [account], setAllowlist);
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { url } = (state as any).payload;
    const urlDisplay = displayUrl(url);

    return (
        <ExternalRequestLayout>
            <div className="account-page__connection-box connection-request__connection-box">{t('waiting')}</div>
            <div className="h-full flex-column align-center">
                <header className="m-v-20">
                    <h1>{t('title', { dApp: urlDisplay, account: displaySplitAddress(selectedAccount) })}</h1>
                </header>
                <p className="connection-request__description">{t('descriptionP1', { dApp: urlDisplay })}</p>
                <p className="connection-request__description">{t('descriptionP2')}</p>
                <div className="flex p-b-10  m-t-auto">
                    <Button width="narrow" className="m-r-10" onClick={withClose(onReject)}>
                        {t('actions.cancel')}
                    </Button>
                    <Button
                        width="narrow"
                        disabled={connectButtonDisabled}
                        onClick={() => {
                            setConnectButtonDisabled(true);
                            connectAccount(selectedAccount, new URL(url).origin).then(withClose(onAllow));
                        }}
                    >
                        {t('actions.connect')}
                    </Button>
                </div>
            </div>
        </ExternalRequestLayout>
    );
}
