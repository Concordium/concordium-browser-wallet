import { AttributeType, RevealStatementV2 } from '@concordium/web-sdk';
import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import WarningTriangleIcon from '@assets/svg/warning-triangle.svg';
import { DisplayStatementLine } from './DisplayStatementLine';
import { DisplayBox } from './DisplayBox';
import { DisplayProps, getPropertyTitle } from './utils';

type Props<Attribute> = DisplayProps<RevealStatementV2, Attribute> & {
    dappName: string;
};

export function DisplayRevealStatements<Attribute extends AttributeType>({
    className,
    statements,
    attributes,
    dappName,
    schema,
    formatAttribute = (_, value) => value.toString(),
}: Props<Attribute>) {
    const { t } = useTranslation('web3IdProofRequest', { keyPrefix: 'displayStatement' });
    const header = t('headers.reveal');

    const lines = statements.map((s) => {
        const value = attributes[s.attributeTag];
        const title = getPropertyTitle(s.attributeTag, schema);
        return {
            attribute: title,
            value: formatAttribute(s.attributeTag, value) ?? 'Unavailable',
            isRequirementMet: value !== undefined,
        };
    });

    return (
        <DisplayBox
            className={className}
            header={header}
            infoBox={
                <>
                    <WarningTriangleIcon />
                    <p className="display4">{t('revealTooltip.header')}</p>
                    <p className="bodyLightL">{t('revealTooltip.body')}</p>
                </>
            }
        >
            <ul className="display-reveal-statements__body list-clear">
                {lines.map((l, i) => (
                    <DisplayStatementLine
                        className="display-reveal-statements__line"
                        // eslint-disable-next-line react/no-array-index-key
                        key={i} // Allow this, as we don't expect these to ever change.
                        {...l}
                    />
                ))}
            </ul>
            <div className="display-reveal-statements__description bodyXS">
                <Trans
                    ns="idProofRequest"
                    i18nKey="displayStatement.revealDescription"
                    components={{ 1: <span className="heading7 color-feedback-negative-dark" /> }}
                    values={{ dappName }}
                />
            </div>
        </DisplayBox>
    );
}
