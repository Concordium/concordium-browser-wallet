import {
    CredentialSchemaSubject,
    IDENTITY_SUBJECT_SCHEMA,
    RevealStatementV2,
    StatementTypes,
} from '@concordium/web-sdk';

import Text from '@popup/popupX/shared/Text';
import { useDisplayAttributeValue } from '@popup/shared/utils/identity-helpers';
import { ConfirmedIdentity } from '@shared/storage/types';
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { SecretStatement, useStatementName, useStatementValue } from '../IdProofRequest/DisplayStatement/utils';
import CredentialSelector, { CredentialSelectorDisplayProps } from './CredentialSelector';
import { DisplayRevealStatements } from './Display/DisplayRevealStatements';
import { DisplaySecretStatements } from './Display/DisplaySecretStatements';
import { OverwriteSecretLine } from './Display/utils';
import { DisplayCredentialStatementProps, SecretStatementV2, StatementWithSource } from './utils';

function DisplayIdentity({ option }: CredentialSelectorDisplayProps<ConfirmedIdentity>) {
    if (option.name) {
        // Allow this expected React component
        // eslint-disable-next-line react/jsx-no-useless-fragment
        return <>{option.name}</>;
    }

    return null;
}

export default function IdentityStatement({
    credentialStatement,
    validCredentials,
    dappName,
    setChosenId,
    showDescription,
}: DisplayCredentialStatementProps<StatementWithSource, ConfirmedIdentity>) {
    const { t } = useTranslation('web3IdProofRequest');
    const reveals = credentialStatement.statement.filter(
        (s) => s.type === StatementTypes.RevealAttribute
    ) as RevealStatementV2[];
    const secrets = credentialStatement.statement.filter(
        (s) => s.type !== StatementTypes.RevealAttribute
    ) as SecretStatementV2[];
    const displayAttribute = useDisplayAttributeValue();

    const [chosenIdentity, setChosenIdentity] = useState<ConfirmedIdentity | undefined>(validCredentials[0]);

    useEffect(() => {
        setChosenId(validCredentials[0].index.toString());
    }, []);

    const onChange = useCallback((identity: ConfirmedIdentity) => {
        setChosenIdentity(identity);
        setChosenId(identity.index.toString());
    }, []);

    const accountCreateSecretLine: OverwriteSecretLine = (statement: SecretStatementV2) => {
        const value = useStatementValue(statement as SecretStatement);
        const attribute = useStatementName(statement as SecretStatement);
        return {
            attribute,
            value,
        };
    };

    if (!chosenIdentity) {
        return null;
    }

    return (
        <>
            {showDescription && <Text.Capture>{t('descriptions.accountCredential')}</Text.Capture>}
            <CredentialSelector<ConfirmedIdentity>
                options={validCredentials}
                Display={DisplayIdentity}
                id={(id) => id.index.toString()}
                onChange={onChange}
                value={chosenIdentity}
            />
            {reveals.length !== 0 && (
                <DisplayRevealStatements
                    dappName={dappName}
                    attributes={chosenIdentity.idObject.value.attributeList.chosenAttributes}
                    statements={reveals}
                    formatAttribute={displayAttribute}
                    schema={IDENTITY_SUBJECT_SCHEMA as CredentialSchemaSubject}
                />
            )}
            {secrets.length !== 0 && (
                <DisplaySecretStatements
                    attributes={chosenIdentity.idObject.value.attributeList.chosenAttributes}
                    statements={secrets}
                    formatAttribute={displayAttribute}
                    schema={IDENTITY_SUBJECT_SCHEMA as CredentialSchemaSubject}
                    overwriteSecretLine={accountCreateSecretLine}
                />
            )}
        </>
    );
}
