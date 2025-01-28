import { Trans, useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import React, { useCallback, useContext } from 'react';
import { fullscreenPromptContext } from '@popup/popupX/page-layouts/FullscreenPromptLayout';
import { usePrivateKey } from '@popup/shared/utils/account-helpers';
import { useSetAtom } from 'jotai';
import { addToastAtom } from '@popup/state';
import { AccountAddress, AccountTransactionSignature, buildBasicAccountSigner, signMessage } from '@concordium/web-sdk';
import Page from '@popup/popupX/shared/Page';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import { Buffer } from 'buffer';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import BinaryDisplay from '@popup/popupX/shared/BinaryDisplay';

type Props = {
    onSubmit(signature: AccountTransactionSignature): void;
    onReject(): void;
};

interface Location {
    state: {
        payload: {
            accountAddress: string;
            message: string | MessageObject;
            url: string;
        };
    };
}

type MessageObject = {
    schema: string;
    data: string;
};

export default function SignMessage({ onSubmit, onReject }: Props) {
    const { state } = useLocation() as Location;
    const { t } = useTranslation('x', { keyPrefix: 'prompts.signMessageX' });
    const { withClose } = useContext(fullscreenPromptContext);
    const { accountAddress, url } = state.payload;
    const key = usePrivateKey(accountAddress);
    const addToast = useSetAtom(addToastAtom);
    const { message } = state.payload;
    const messageIsAString = typeof message === 'string';

    const onClick = useCallback(async () => {
        if (!key) {
            throw new Error('Missing key for the chosen address');
        }

        return signMessage(
            AccountAddress.fromBase58(accountAddress),
            messageIsAString ? message : Buffer.from(message.data, 'hex'),
            buildBasicAccountSigner(key)
        );
    }, [state.payload.message, state.payload.accountAddress, key]);

    return (
        <Page className="sign-message-x">
            <Page.Top heading={t('signRequest')} />
            <Page.Main>
                <Text.Main>
                    <Trans
                        ns="x"
                        i18nKey="prompts.signCis3.signTransaction"
                        components={{ 1: <span className="white" /> }}
                        values={{ dApp: displayUrl(url) }}
                    />
                </Text.Main>

                <BinaryDisplay message={message} url={url} />
            </Page.Main>
            <Page.Footer>
                <Button.Main className="secondary" label={t('reject')} onClick={withClose(onReject)} />
                <Button.Main
                    label={t('sign')}
                    onClick={() => {
                        onClick()
                            .then(withClose(onSubmit))
                            .catch((e) => addToast(e.message));
                    }}
                />
            </Page.Footer>
        </Page>
    );
}
