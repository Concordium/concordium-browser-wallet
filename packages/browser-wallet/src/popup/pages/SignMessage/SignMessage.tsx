import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import React, { useContext, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useAtomValue } from 'jotai';
import { selectedAccountAtom } from '@popup/store/account';
import { credentialsAtom } from '@popup/store/settings';
import { signMessage, buildBasicAccountSigner, AccountTransactionSignature } from '@concordium/web-sdk';

type Props = {
    onSubmit(signature: AccountTransactionSignature): void;
    onReject(): void;
};

interface Location {
    state: {
        payload: {
            message: string;
        };
    };
}

export default function SignMessage({ onSubmit, onReject }: Props) {
    const { state } = useLocation() as Location;
    const [error, setError] = useState();
    const { t } = useTranslation('signMessage');
    const address = useAtomValue(selectedAccountAtom);
    const creds = useAtomValue(credentialsAtom);
    const { withClose } = useContext(fullscreenPromptContext);

    const onClick = useCallback(async () => {
        if (!address) {
            throw new Error('Missing chosen address');
        }
        const key = creds.find((c) => c.address === address)?.key;
        if (!key) {
            throw new Error('Missing key for the chosen address');
        }
        return signMessage(state.payload.message, buildBasicAccountSigner(key));
    }, [state.payload.message]);

    return (
        <>
            <div>{t('description')}</div>
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
