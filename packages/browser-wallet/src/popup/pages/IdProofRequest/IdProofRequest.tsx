import React, { useCallback, useContext, useEffect, useState } from 'react';

import ExternalRequestLayout from '@popup/page-layouts/ExternalRequestLayout';
import { fullscreenPromptContext } from '@popup/page-layouts/FullscreenPromptLayout';
import Button from '@popup/shared/Button';
import {
    DocTypes,
    EU_MEMBERS,
    IdStatement,
    MAX_DATE,
    MIN_DATE,
    RevealStatement,
    StatementTypes,
} from '@popup/shared/idProofTypes';
import { useAtomValue } from 'jotai';
import { selectedAccountAtom } from '@popup/store/account';
import { useTranslation } from 'react-i18next';
import ButtonGroup from '@popup/shared/ButtonGroup';
import { DisplayRevealStatement, DisplaySecretStatement } from './DisplayStatement';
import { SecretStatement } from './DisplayStatement/utils';

const mock: IdStatement = [
    {
        type: StatementTypes.AttributeInRange,
        attributeTag: 'dob',
        lower: MIN_DATE,
        upper: '19820101',
    },
    {
        type: StatementTypes.AttributeInRange,
        attributeTag: 'idDocExpiresAt',
        lower: '20230601',
        upper: MAX_DATE,
    },
    {
        type: StatementTypes.AttributeInRange,
        attributeTag: 'idDocIssuedAt',
        lower: MIN_DATE,
        upper: '20230101',
    },
    {
        type: StatementTypes.AttributeInSet,
        attributeTag: 'nationality',
        set: EU_MEMBERS,
    },
    {
        type: StatementTypes.AttributeNotInSet,
        attributeTag: 'nationality',
        set: ['DK', 'SE', 'NO', 'FI'],
    },
    {
        type: StatementTypes.AttributeInSet,
        attributeTag: 'idDocType',
        set: [DocTypes.Passport, DocTypes.DriversLicense],
    },
    {
        type: StatementTypes.AttributeNotInSet,
        attributeTag: 'idDocType',
        set: [DocTypes.NA, DocTypes.ImmigrationCard],
    },
    {
        type: StatementTypes.AttributeInSet,
        attributeTag: 'idDocIssuer',
        set: ['DK', 'SE', 'NO', 'FI'],
    },
    {
        type: StatementTypes.AttributeNotInSet,
        attributeTag: 'idDocIssuer',
        set: ['DK', 'SE', 'NO', 'FI'],
    },
    {
        type: StatementTypes.RevealAttribute,
        attributeTag: 'firstName',
    },
    {
        type: StatementTypes.RevealAttribute,
        attributeTag: 'lastName',
    },
    {
        type: StatementTypes.RevealAttribute,
        attributeTag: 'idDocIssuedAt',
    },
];

type Props = {
    onSubmit(proof: unknown): void;
    onReject(): void;
};

export default function IdProofRequest({ onReject, onSubmit }: Props) {
    const { onClose, withClose } = useContext(fullscreenPromptContext);
    const hasStatements = mock.length > 0;
    const [canProove, setCanProove] = useState(hasStatements);
    const { t } = useTranslation('idProofRequest');

    const account = useAtomValue(selectedAccountAtom); // TODO: change to account included in request.

    const reveals = mock.filter((s) => s.type === StatementTypes.RevealAttribute) as RevealStatement[];
    const secrets = mock.filter((s) => s.type !== StatementTypes.RevealAttribute) as SecretStatement[];
    const dappName = 'Example dapp'; // TODO: get from chrome API.

    useEffect(() => onClose(onReject), [onClose, onReject]);

    const handleInvalidStatement = useCallback(() => {
        if (canProove) {
            setCanProove(false);
        }
    }, [canProove]);

    if (!account) {
        return null;
    }

    return (
        <ExternalRequestLayout>
            <div className="id-proof-request">
                <div>
                    <h1 className="m-t-0 text-center">{t('header', { dappName })}</h1>
                    {reveals.length !== 0 && (
                        <DisplayRevealStatement
                            className="m-t-10:not-first"
                            dappName={dappName}
                            account={account}
                            statements={reveals}
                            onInvalid={handleInvalidStatement}
                        />
                    )}
                    {secrets.map((s, i) => (
                        <DisplaySecretStatement
                            // eslint-disable-next-line react/no-array-index-key
                            key={i} // Allow this, as we don't expect these to ever change.
                            className="m-t-10:not-first"
                            dappName={dappName}
                            account={account}
                            statement={s}
                            onInvalid={handleInvalidStatement}
                        />
                    ))}
                </div>
                <ButtonGroup className="id-proof-request__actions">
                    <Button onClick={withClose(onReject)}>{t('reject')}</Button>
                    <Button onClick={withClose(onSubmit)} disabled={!canProove}>
                        {t('accept')}
                    </Button>
                </ButtonGroup>
            </div>
        </ExternalRequestLayout>
    );
}
