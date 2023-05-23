import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { DeployModulePayload, sha256 } from '@concordium/web-sdk';
import { chunkString } from 'wallet-common-helpers';
import CopyButton from '@popup/shared/CopyButton';
import OptionalField from './OptionalField';

interface Props {
    payload: DeployModulePayload;
}

/**
 * Displays an overview of a deploy module transaction.
 */
export default function DisplayDeployModule({ payload }: Props) {
    const { t } = useTranslation('sendTransaction');
    const hash = useMemo(() => sha256([payload.source]).toString('hex'), []);

    return (
        <>
            <OptionalField title={t('version')} value={payload.version} />
            <h5>{t('moduleReference')}:</h5>
            <div className="flex align-center">
                <p className="mono transaction-receipt__value text-center m-0">{chunkString(hash, 32).join('\n')}</p>
                <CopyButton className="transaction-receipt__copy-button" value={hash} />
            </div>
        </>
    );
}
