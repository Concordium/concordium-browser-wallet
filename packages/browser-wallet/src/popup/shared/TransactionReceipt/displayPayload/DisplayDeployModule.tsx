import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DeployModulePayload, sha256 } from '@concordium/web-sdk';
import { chunkString } from 'wallet-common-helpers';
import OptionalField from './OptionalField';

interface Props {
    payload: DeployModulePayload;
}

/**
 * Displays an overview of a update contract transaction.
 */
export default function DisplayDeployModule({ payload }: Props) {
    const { t } = useTranslation('sendTransaction');
    const hash = useMemo(() => sha256([payload.source]).toString('hex'), []);

    return (
        <>
            <OptionalField title={t('version')} value={payload.version} />
            <h5>{t('sourceHash')}:</h5>
            <div className="mono transaction-receipt__value text-center">{chunkString(hash, 32).join('\n')}</div>
        </>
    );
}
