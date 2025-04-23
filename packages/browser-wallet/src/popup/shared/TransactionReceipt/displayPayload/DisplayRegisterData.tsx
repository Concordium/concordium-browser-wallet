import React, { useEffect, useState } from 'react';
import { decode } from 'cbor2';
import { useTranslation } from 'react-i18next';
import { RegisterDataPayload } from '@concordium/web-sdk';

interface Props {
    payload: RegisterDataPayload;
}

/**
 * Displays an overview of a register data.
 */
export default function DisplayRegisterData({ payload }: Props) {
    const { t } = useTranslation('sendTransaction');
    const [decoded, setDecoded] = useState<string>();

    useEffect(() => {
        try {
            setDecoded(decode(payload.data.data));
        } catch {
            // display raw if unable to decode
        }
    }, []);

    return (
        <>
            <h5>
                {t('data')}: {!decoded && <i>{t('rawData')}</i>}
            </h5>
            {decoded && <div className="text-center word-break-all">{decoded}</div>}
            {!decoded && <div className="text-center word-break-all">{payload.data.toJSON()}</div>}
        </>
    );
}
