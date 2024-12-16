import { AttributeType, RevealStatementV2 } from '@concordium/web-sdk';
import React from 'react';
import { useTranslation } from 'react-i18next';
import clsx from 'clsx';

import Card from '@popup/popupX/shared/Card';
import Text from '@popup/popupX/shared/Text';
import Button from '@popup/popupX/shared/Button';
import InfoIcon from '@assets/svgX/info.svg';

import { DisplayStatementLine } from './DisplayStatementLine';
import { DisplayProps, defaultFormatAttribute, getPropertyTitle } from './utils';

type Props<Attribute> = DisplayProps<RevealStatementV2, Attribute> & {
    dappName: string;
};

export function DisplayRevealStatements<Attribute extends AttributeType>({
    className,
    statements,
    attributes,
    dappName,
    schema,
    formatAttribute = defaultFormatAttribute,
}: Props<Attribute>) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.verifiablePresentationRequest.displayStatement' });

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
        <Card className={clsx(className, 'display-statement-x')} type="grey">
            <Card.Row className="display-statement-x__header">
                <Text.CaptureAdditional>{t('headers.reveal')}</Text.CaptureAdditional>
                <Button.Base>
                    <InfoIcon />
                </Button.Base>
            </Card.Row>
            {lines.map((l, i) => (
                <Card.Row className="display-statement-x__row">
                    <Text.CaptureAdditional>
                        <DisplayStatementLine
                            // eslint-disable-next-line react/no-array-index-key
                            key={i} // Allow this, as we don't expect these to ever change.
                            {...l}
                        />
                    </Text.CaptureAdditional>
                </Card.Row>
            ))}
            <Card.Row className="display-statement-x__row">
                <Text.Capture>{t('revealDescription', { dappName })}</Text.Capture>
            </Card.Row>
        </Card>
    );
}
