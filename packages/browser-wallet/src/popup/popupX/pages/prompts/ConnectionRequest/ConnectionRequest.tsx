import React, { useContext, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { useAtom, useAtomValue } from 'jotai';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import { displayNameOrSplitAddress } from '@popup/shared/utils/account-helpers';
import { selectedCredentialAtom, storedAllowlistAtom } from '@popup/store/account';
import { fullscreenPromptContext } from '@popup/popupX/page-layouts/FullscreenPromptLayout';
import { handleAllowlistEntryUpdate } from '@popup/pages/Allowlist/util';
import { useUrlDisplay } from '@popup/popupX/shared/utils/helpers';

type Props = {
    onAllow(): void;
    onReject(): void;
};

export default function ConnectionRequest({ onAllow, onReject }: Props) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.connectionRequestX' });
    const [urlDisplay, url] = useUrlDisplay();
    const { onClose, withClose } = useContext(fullscreenPromptContext);
    const selectedAccount = useAtomValue(selectedCredentialAtom);
    const [allowlistLoading, setAllowlist] = useAtom(storedAllowlistAtom);
    const allowlist = allowlistLoading.value;
    const [connectButtonDisabled, setConnectButtonDisabled] = useState<boolean>(false);

    useEffect(() => onClose(onReject), [onClose, onReject]);

    if (!selectedAccount || allowlistLoading.loading) {
        return null;
    }

    async function connectAccount(account: string, urlString: string) {
        await handleAllowlistEntryUpdate(urlString, allowlist, [account], setAllowlist);
    }

    return (
        <Page className="connection-request-x">
            <Page.Top heading={t('newConnection')} />
            <Page.Main>
                <Text.Main>
                    <Trans
                        ns="x"
                        i18nKey="prompts.connectionRequestX.connectTo"
                        components={{ 1: <span className="white" /> }}
                        values={{ dApp: urlDisplay, account: displayNameOrSplitAddress(selectedAccount) }}
                    />
                </Text.Main>
                <Text.Capture>
                    <Trans
                        ns="x"
                        i18nKey="prompts.connectionRequestX.connectionDetails"
                        components={{ 1: <span className="white" /> }}
                        values={{ dApp: urlDisplay }}
                    />
                </Text.Capture>
            </Page.Main>
            <Page.Footer>
                <Button.Main className="secondary" label={t('cancel')} onClick={withClose(onReject)} />
                <Button.Main
                    label={t('connect')}
                    disabled={connectButtonDisabled}
                    onClick={() => {
                        setConnectButtonDisabled(true);
                        connectAccount(selectedAccount.address, new URL(url).origin).then(withClose(onAllow));
                    }}
                />
            </Page.Footer>
        </Page>
    );
}
