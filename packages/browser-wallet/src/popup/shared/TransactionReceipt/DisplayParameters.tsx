import React from 'react';
import { useTranslation } from 'react-i18next';
import { SmartContractParameters } from '@concordium/browser-wallet-api-helpers';

type Props = {
    parameters?: SmartContractParameters;
};

export default function DisplayParameters({ parameters }: Props) {
    const { t } = useTranslation('shared', { keyPrefix: 'transactionReceipt' });

    const hasParameters = parameters !== undefined && parameters !== null;

    return (
        <>
            {hasParameters && (
                <>
                    <h5 className="m-b-5">{t('parameter')}:</h5>
                    <pre className="transaction-receipt__parameter">{JSON.stringify(parameters, null, 2)}</pre>
                </>
            )}
            {!hasParameters && <h5>{t('noParameter')}</h5>}
        </>
    );
}
