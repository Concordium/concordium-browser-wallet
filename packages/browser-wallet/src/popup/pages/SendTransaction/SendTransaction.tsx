import React from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

type Props = {
    onSubmit(): void;
};

export default function SendTransaction({ onSubmit }: Props) {
    const { state } = useLocation();
    const { t } = useTranslation('sendTransaction');

    return (
        <>
            <div>{t('description')}</div>
            {JSON.stringify(state)}
            <button type="button" onClick={() => onSubmit()}>
                Submit
            </button>
        </>
    );
}
