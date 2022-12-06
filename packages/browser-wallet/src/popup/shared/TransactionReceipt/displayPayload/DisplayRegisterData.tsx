import React from 'react';
import { useTranslation } from 'react-i18next';
import { RegisterDataPayload } from '@concordium/web-sdk';

interface Props {
    payload: RegisterDataPayload;
}

/**
 * Displays an overview of a register data.
 * TODO: Display decoded cbor (and this as fallback if it is not)
 */
export default function DisplayRegisterData({ payload }: Props) {
    const { t } = useTranslation('sendTransaction');

    return (
        <>
            <h5>{t('data')}:</h5>
            <div>{payload.data.toJSON()}</div>
        </>
    );
}
