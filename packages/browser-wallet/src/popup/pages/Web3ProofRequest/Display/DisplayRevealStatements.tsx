import { AttributeType, RevealStatementV2 } from '@concordium/web-sdk';
import { VerifiableCredentialSchema } from '@shared/storage/types';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ClassName } from 'wallet-common-helpers';
import { DisplayStatementLine } from '../../IdProofRequest/DisplayStatement/DisplayStatement';
import { DisplayBox } from './DisplayBox';
import { getPropertyTitle } from './utils';

type RevealProps = ClassName & {
    dappName: string;
    statements: RevealStatementV2[];
    attributes: Record<string, AttributeType>;
    schema: VerifiableCredentialSchema;
    className: string;
};

export function DisplayRevealStatements({ className, statements, attributes, dappName, schema }: RevealProps) {
    const { t } = useTranslation('web3IdProofRequest', { keyPrefix: 'displayStatement' });
    const header = t('headers.reveal');

    const lines = statements.map((s) => {
        const value = attributes[s.attributeTag];
        const title = getPropertyTitle(s.attributeTag, schema);
        return {
            attribute: title,
            value: value.toString() ?? 'Unavailable',
            isRequirementMet: value !== undefined,
        };
    });

    return (
        <DisplayBox
            className={className}
            header={header}
            infoBox={
                <>
                    <p className="display4">{t('revealTooltip.header')}</p>
                    <p className="bodyLightL">{t('revealTooltip.body')}</p>
                </>
            }
        >
            <ul className="list-clear p-5 m-0">
                {lines.map((l, i) => (
                    <DisplayStatementLine
                        className="display-reveal-statements__line"
                        // eslint-disable-next-line react/no-array-index-key
                        key={i} // Allow this, as we don't expect these to ever change.
                        {...l}
                    />
                ))}
            </ul>
            <div className="display-statement__description">
                <Trans
                    ns="idProofRequest"
                    i18nKey="displayStatement.revealDescription"
                    components={{ 1: <strong /> }}
                    values={{ dappName }}
                />
            </div>
        </DisplayBox>
    );
}
