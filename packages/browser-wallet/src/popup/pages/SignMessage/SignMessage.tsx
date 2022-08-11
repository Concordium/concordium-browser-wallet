import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import React, { useContext, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { signMessage, buildBasicAccountSigner, AccountTransactionSignature } from '@concordium/web-sdk';
import { usePrivateKey } from '@popup/shared/utils/account-helpers';

type Props = {
    onSubmit(signature: AccountTransactionSignature): void;
    onReject(): void;
};

interface Location {
    state: {
        payload: {
            accountAddress: string;
            message: string;
        };
    };
}

export default function SignMessage({ onSubmit, onReject }: Props) {
    const { state } = useLocation() as Location;
    const [error, setError] = useState();
    const { t } = useTranslation('signMessage');
    const { withClose } = useContext(fullscreenPromptContext);
    const address = state.payload.accountAddress;
    const key = usePrivateKey(address);

    const onClick = useCallback(async () => {
        if (!key) {
            throw new Error('Missing key for the chosen address');
        }
        return signMessage(state.payload.message, buildBasicAccountSigner(key));
    }, [state.payload.message, state.payload.accountAddress]);

    return (
        <>
            <div>{t('description', { address })}</div>
            <p>{state.payload.message}</p>
            <button
                type="button"
                onClick={() =>
                    onClick()
                        .then(withClose(onSubmit))
                        .catch((e) => setError(e))
                }
            >
                {t('sign')}
            </button>
            <button type="button" onClick={withClose(onReject)}>
                {t('deny')}
            </button>
            {error && (
                <p>
                    {t('error')}: {error}
                </p>
            )}
        </>
    );
}
