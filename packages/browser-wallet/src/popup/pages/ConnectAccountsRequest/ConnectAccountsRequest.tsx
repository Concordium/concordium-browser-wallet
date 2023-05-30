import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import { storedAllowListAtom } from '@popup/store/account';
import { useAtom } from 'jotai';
import React, { useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import ExternalRequestLayout from '@popup/page-layouts/ExternalRequestLayout';
import Button from '@popup/shared/Button';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import AllowlistEntryView, { AllowlistMode } from '../Allowlist/AllowlistEntryView';
import { updateAllowList } from '../Allowlist/util';

type Props = {
    onAllow(): void;
    onReject(): void;
};

export default function ConnectAccountsRequest({ onAllow, onReject }: Props) {
    const { state } = useLocation();
    const { t } = useTranslation('connectAccountsRequest');
    const { onClose, withClose } = useContext(fullscreenPromptContext);
    const [accountsToAdd, setAccountsToAdd] = useState<string[]>([]);
    const [connectButtonDisabled, setConnectButtonDisabled] = useState<boolean>(false);
    const [allowListLoading, setAllowList] = useAtom(storedAllowListAtom);

    useEffect(() => onClose(onReject), [onClose, onReject]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { url } = (state as any).payload;
    const urlDisplay = displayUrl(url);

    return (
        <ExternalRequestLayout>
            <div className="h-full flex-column align-center">
                <header className="text-center">
                    <h3 className="m-v-5">{t('header', { url: urlDisplay })}</h3>
                </header>
                <AllowlistEntryView
                    selectedAccounts={accountsToAdd}
                    setSelectedAccounts={setAccountsToAdd}
                    mode={AllowlistMode.Add}
                />
                <div className="flex p-b-10 m-t-auto">
                    <Button width="narrow" className="m-r-10" onClick={withClose(onReject)}>
                        {t('actions.cancel')}
                    </Button>
                    <Button
                        width="narrow"
                        disabled={connectButtonDisabled}
                        onClick={() => {
                            setConnectButtonDisabled(true);
                            updateAllowList(
                                new URL(url).origin,
                                allowListLoading.value,
                                accountsToAdd,
                                setAllowList
                            ).then(withClose(onAllow));
                        }}
                    >
                        {t('actions.connect')}
                    </Button>
                </div>
            </div>
        </ExternalRequestLayout>
    );
}
