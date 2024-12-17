/* eslint-disable react/prop-types */
import clsx from 'clsx';
import React, { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { ClassName } from 'wallet-common-helpers';
import { RevealStatement, AttributeList } from '@concordium/web-sdk';

import { useDisplayAttributeValue, useGetAttributeName } from '@popup/shared/utils/identity-helpers';
import { ConfirmedIdentity } from '@shared/storage/types';
import { canProveStatement } from '@shared/utils/proof-helpers';
import Card from '@popup/popupX/shared/Card';
import Text from '@popup/popupX/shared/Text';

import {
    SecretStatement,
    useStatementDescription,
    useStatementHeader,
    useStatementValue,
    useStatementName,
} from './utils';
import DisplayStatementsTooltip from './DisplayStatementsTooltip';
import ExternalLink from '@popup/popupX/shared/ExternalLink';
import urls from '@shared/constants/url';

export type StatementLine = {
    attribute: string;
    value: string;
    isRequirementMet: boolean;
};

type StatementLineProps = StatementLine & ClassName;

export function DisplayStatementLine({ attribute, value, isRequirementMet, className }: StatementLineProps) {
    return (
        <div
            className={clsx(
                className,
                'display-statement-x__line',
                isRequirementMet && 'display-statement-x__line--valid'
            )}
        >
            <div>{attribute}</div>
            <div>{value}</div>
        </div>
    );
}

type BaseViewProps = ClassName & {
    header: string;
    lines: StatementLine[];
    dappName: string;
};

type RevealViewProps = BaseViewProps & {
    reveal: true;
};

type SecretViewProps = BaseViewProps & {
    reveal?: false;
    description?: string;
};

type ViewProps = RevealViewProps | SecretViewProps;

export function DisplayStatementView({ className, lines, dappName, header, ...props }: ViewProps) {
    const { t } = useTranslation('x', { keyPrefix: 'prompts.idProofRequestX.displayStatement' });

    return (
        <Card className={clsx(className, 'display-statement-x')} type="grey">
            <Card.Row className="display-statement-x__header">
                <Text.CaptureAdditional>{header}</Text.CaptureAdditional>
                <DisplayStatementsTooltip>
                    {props.reveal ? (
                        <Text.MainMedium>{t('revealTooltip.header')}</Text.MainMedium>
                    ) : (
                        <Text.MainMedium>{t('secretTooltip.header')}</Text.MainMedium>
                    )}
                    <Text.Capture>
                        <Trans
                            t={t}
                            i18nKey={props.reveal ? 'revealTooltip.body' : 'secretTooltip.body'}
                            components={{ 1: <ExternalLink path={urls.zkpDocumentation} /> }}
                        />
                    </Text.Capture>
                </DisplayStatementsTooltip>
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
            <Text.Capture className="m-t-5 block">
                {props.reveal ? (
                    <Trans
                        ns="idProofRequest"
                        i18nKey="displayStatement.revealDescription"
                        components={{ 1: <strong /> }}
                        values={{ dappName }}
                    />
                ) : (
                    props.description
                )}
            </Text.Capture>
        </Card>
    );
}

type BaseProps = ClassName & {
    identity: ConfirmedIdentity;
    dappName: string;
    onInvalid(): void;
};

export function DisplayRevealStatement({
    dappName,
    statements,
    identity,
    className,
    onInvalid,
}: DisplayRevealStatementProps) {
    const { t } = useTranslation('idProofRequest', { keyPrefix: 'displayStatement' });
    const getAttributeName = useGetAttributeName();
    const displayAttribute = useDisplayAttributeValue();
    const attributes =
        identity.idObject.value.attributeList.chosenAttributes ?? ({} as AttributeList['chosenAttributes']);
    const header = t('headers.reveal');

    const lines: StatementLine[] = statements.map((s) => {
        const raw = attributes[s.attributeTag];
        const value = displayAttribute(s.attributeTag, attributes[s.attributeTag] ?? '');

        return {
            attribute: getAttributeName(s.attributeTag),
            value: value ?? 'Unavailable',
            isRequirementMet: raw !== undefined,
        };
    });

    const isInvalid = lines.some((l) => !l.isRequirementMet);

    useEffect(() => {
        if (lines.some((l) => !l.isRequirementMet)) {
            onInvalid();
        }
    }, [isInvalid]);

    return <DisplayStatementView reveal lines={lines} dappName={dappName} header={header} className={className} />;
}

type DisplayRevealStatementProps = BaseProps & {
    statements: RevealStatement[];
};

type DisplaySecretStatementProps = BaseProps & {
    statement: SecretStatement;
};

export function DisplaySecretStatement({
    dappName,
    statement,
    identity,
    className,
    onInvalid,
}: DisplaySecretStatementProps) {
    const header = useStatementHeader(statement);
    const value = useStatementValue(statement);
    const description = useStatementDescription(statement, identity);
    const attribute = useStatementName(statement);
    const isRequirementMet = canProveStatement(statement, identity);

    const lines: StatementLine[] = [
        {
            attribute,
            value,
            isRequirementMet,
        },
    ];

    useEffect(() => {
        if (!isRequirementMet) {
            onInvalid();
        }
    }, [isRequirementMet]);

    return (
        <DisplayStatementView
            lines={lines}
            dappName={dappName}
            header={header}
            description={description}
            className={className}
        />
    );
}
