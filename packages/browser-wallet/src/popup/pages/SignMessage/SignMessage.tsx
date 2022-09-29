import React, { useContext, useCallback } from 'react';
import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import { useTranslation } from 'react-i18next';
import { useSetAtom } from 'jotai';
import { useLocation } from 'react-router-dom';
import { signMessage, buildBasicAccountSigner, AccountTransactionSignature, AccountAddress } from '@concordium/web-sdk';
import { usePrivateKey } from '@popup/shared/utils/account-helpers';
import { displayUrl } from '@popup/shared/utils/string-helpers';
import { TextArea } from '@popup/shared/Form/TextArea';
import ConnectedBox from '@popup/pages/Account/ConnectedBox';
import Button from '@popup/shared/Button';
import { addToastAtom } from '@popup/state';
import ExternalRequestLayout from '@popup/page-layouts/ExternalRequestLayout';

type Props = {
    onSubmit(signature: AccountTransactionSignature): void;
    onReject(): void;
};

interface Location {
    state: {
        payload: {
            accountAddress: string;
            message: string;
            url: string;
        };
    };
}

export default function SignMessage({ onSubmit, onReject }: Props) {
    const { state } = useLocation() as Location;
    const { t } = useTranslation('signMessage');
    const { withClose } = useContext(fullscreenPromptContext);
    const { accountAddress, url } = state.payload;
    const key = usePrivateKey(accountAddress);
    const addToast = useSetAtom(addToastAtom);

    const onClick = useCallback(async () => {
        if (!key) {
            throw new Error('Missing key for the chosen address');
        }
        return signMessage(new AccountAddress(accountAddress), state.payload.message, buildBasicAccountSigner(key));
    }, [state.payload.message, state.payload.accountAddress, key]);

    return (
        <ExternalRequestLayout>
            <ConnectedBox accountAddress={accountAddress} url={new URL(url).origin} />
            <div className="h-full flex-column align-center">
                <div>{t('description', { dApp: displayUrl(url) })}</div>
                <TextArea className="m-v-20 w-full flex-child-fill" value={state.payload.message} />
                <div className="flex p-b-10  m-t-auto">
                    <Button width="narrow" className="m-r-10" onClick={withClose(onReject)}>
                        {t('reject')}
                    </Button>
                    <Button
                        width="narrow"
                        onClick={() =>
                            onClick()
                                .then(withClose(onSubmit))
                                .catch((e) => addToast(e.message))
                        }
                    >
                        {t('sign')}
                    </Button>
                </div>
            </div>
        </ExternalRequestLayout>
    );
}
